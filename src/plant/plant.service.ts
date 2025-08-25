// src/plant/plant.service.ts
import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plant } from './plant.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { Project } from 'src/projects/project.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { Unit } from 'src/unit/unit.entity'; // Asegúrate de que esta sea tu entidad de Unidad
// Asegúrate de tener axios instalado: npm install axios
import axios from 'axios';

@Injectable()
export class PlantService {
  private readonly logger = new Logger(PlantService.name);
  private readonly geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent`;
  // !!! IMPORTANTE: DEBES CONFIGURAR ESTA VARIABLE DE ENTORNO EN TU PROYECTO NEST.JS
  // Por ejemplo, en un archivo .env: GEMINI_API_KEY=TU_API_KEY_AQUI
  private readonly geminiApiKey = process.env.GEMINI_API_KEY || ""; // Obtener de variables de entorno

  constructor(
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(dto: CreatePlantDto, file?: Express.Multer.File): Promise<Plant> {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    let uploadedUrl: string | undefined;
    if (file) {
      // Tu servicio de Cloudinary asumo que maneja la detección del tipo de archivo (PDF/Imagen)
      // Ajusta 'uploadPdf' si también debe manejar imágenes, o crea un 'uploadImage'
      const result = await this.cloudinaryService.uploadPdf(file); // o uploadImage(file)
      uploadedUrl = result.secure_url;
    }

    const plant = this.plantRepository.create({
      name: dto.name,
      level: dto.level,
      floorPlanUrl: uploadedUrl ?? dto.floorPlanUrl ?? undefined, // ✅ evita null
      project,
    });

    return await this.plantRepository.save(plant);
  }

  async findByProject(projectId: number): Promise<Plant[]> {
    return this.plantRepository.find({
      where: { project: { id: projectId } },
      relations: ['project'],
    });
  }

  /**
   * Detectar unidades en el plano de la planta utilizando la API de Gemini y guardarlas.
   * La entidad Unit DEBE tener columnas como polygon (jsonb), angle, width, height, centerX, centerY, y number (string).
   */
  async detectUnits(plantId: number) {
    const plant = await this.plantRepository.findOne({ where: { id: plantId } });
    if (!plant) throw new NotFoundException('Planta no encontrada');
    if (!plant.floorPlanUrl) throw new BadRequestException('La planta no tiene floorPlanUrl para analizar.');

    this.logger.log(`Iniciando detección de unidades para la planta ${plantId} desde URL: ${plant.floorPlanUrl}`);

    let imageBuffer: Buffer;
    let mimeType: string;

    // 1. Descargar la imagen del plano desde la URL
    try {
      const imageResponse = await axios.get(plant.floorPlanUrl, { responseType: 'arraybuffer' });
      imageBuffer = Buffer.from(imageResponse.data);
      mimeType = imageResponse.headers['content-type'] || 'image/jpeg'; // Fallback

      if (!mimeType.startsWith('image/')) {
        throw new Error(`La URL del plano no apunta a una imagen válida. Tipo detectado: ${mimeType}`);
      }
    } catch (error) {
      this.logger.error(`Error al descargar o validar la imagen de la URL ${plant.floorPlanUrl}:`, error.message);
      throw new InternalServerErrorException('Error al obtener la imagen del plano. Asegúrate de que la URL sea accesible y la imagen exista.');
    }

    // 2. Convertir el buffer de la imagen a base64
    const planoBase64 = imageBuffer.toString('base64');

    // 3. El prompt mejorado para la IA
    const prompt = `
      Eres un microservicio de IA especializado en el análisis de planos arquitectónicos para la industria de la construcción, llamado "AP-Extractor" (Apartment Plan Extractor). Tu función principal es recibir una imagen de un plano de planta de un hotel o edificio residencial y, utilizando visión por computadora (Computer Vision), identificar cada apartamento o habitación individual, y devolver sus coordenadas exactas en un formato estructurado (JSON).

      Contexto de la Tarea:
      Un usuario carga un plano en formato de imagen (JPEG, PNG) a VistaDocs. La plataforma te envía esta imagen a través de una llamada a tu API. Debes analizar la imagen para detectar las unidades residenciales (apartamentos o habitaciones de hotel). El objetivo final es permitir que una aplicación frontend utilice las coordenadas que tú proporciones para dibujar polígonos o cajas delimitadoras (bounding boxes) sobre cada apartamento, haciéndolos interactivos (por ejemplo, para mostrar información, estado de la construcción, etc.).

      Requisitos del Proceso:

      1.  Recepción de la Imagen: El input será un archivo de imagen (base64 encoded).
      2.  Análisis de la Imagen:
          * Identifica las estructuras repetitivas que corresponden a apartamentos o habitaciones. Un "apartamento" se define como una unidad delimitada que contiene:
              * Al menos un baño (con inodoro, lavabo y/o ducha/bañera).
              * Un área principal (sala de estar, dormitorio principal o estudio).
              * Entrada claramente definida.
          * Ignora específicamente áreas comunes como pasillos, escaleras, ascensores, áreas técnicas (cuartos de máquinas, subestaciones), muros externos del edificio y espacios sin uso residencial claro.
          * Debes ser capaz de manejar planos con diferentes orientaciones, incluyendo secciones rotadas o en ángulo, y adaptarte a variaciones en el diseño interior de las unidades.
          * Prioriza la identificación de unidades completamente cerradas o con límites claros.
      3.  Extracción de Coordenadas:
          * Para cada apartamento identificado, calcula las coordenadas de su polígono o, en su defecto, de su caja delimitadora (bounding box).
          * El sistema de coordenadas debe tener su origen (0,0) en la esquina superior izquierda de la imagen.
          * Las coordenadas deben ser precisas a nivel de píxel.
          * Cada polígono debe ser un array de puntos [x, y] que encierra lo más precisamente posible el área habitable de la unidad.
      4.  Formato de Salida:
          * La respuesta debe ser un objeto JSON.
          * El objeto principal contendrá una clave 'apartments', que será una lista (array) de objetos.
          * Cada objeto en la lista representará un apartamento y tendrá dos claves:
              * 'id': Un identificador único para el apartamento, generado secuencialmente (ej: "apt-01", "apt-02").
              * 'coordinates': Un array de puntos [x, y] que definen el polígono que encierra al apartamento. Los puntos deben estar en orden consecutivo para formar el polígono.

      Ejemplo de Salida en JSON:

      \`\`\`json
      {
        "plano_id": "Wildstone_Infra_Hotel_Planta_1",
        "apartments": [
          {
            "id": "apt-01",
            "coordinates": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
          },
          {
            "id": "apt-02",
            "coordinates": [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]
          }
        ]
      }
      \`\`\`

      Instrucción Final:
      Analiza la siguiente imagen del plano "${plant.name || 'plano-desconocido'}" (ID: ${plantId}) y genera la salida JSON correspondiente con las coordenadas de todos los apartamentos identificados.
    `;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: planoBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            plano_id: { type: "STRING" },
            apartments: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "STRING" },
                  coordinates: {
                    type: "ARRAY",
                    items: {
                      type: "ARRAY",
                      items: { type: "NUMBER" },
                      minItems: 2,
                      maxItems: 2,
                    },
                  },
                },
                required: ["id", "coordinates"],
              },
            },
          },
          required: ["plano_id", "apartments"],
        },
      },
    };

    let geminiResponse: any;
    let retries = 0;
    const maxRetries = 5;
    let delay = 1000; // 1 segundo inicial para reintentos

    // 4. Llamar a la API de Gemini con reintentos (Exponential Backoff)
    while (retries < maxRetries) {
      try {
        this.logger.log(`Enviando solicitud a Gemini API para planta ${plantId} (Intento: ${retries + 1})...`);
        const response = await axios.post(`${this.geminiApiUrl}?key=${this.geminiApiKey}`, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          // Añade un timeout para evitar que las solicitudes se queden colgadas indefinidamente
          timeout: 60000, // 60 segundos
        });

        const result = response.data;
        if (
          result.candidates &&
          result.candidates.length > 0 &&
          result.candidates[0].content &&
          result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0
        ) {
          const jsonString = result.candidates[0].content.parts[0].text;
          geminiResponse = JSON.parse(jsonString);
          this.logger.log(`Respuesta de Gemini recibida y parseada exitosamente para planta ${plantId}.`);
          break; // Salir del bucle de reintentos en caso de éxito
        } else {
          throw new Error('Estructura de respuesta inesperada de Gemini.');
        }
      } catch (error) {
        retries++;
        if (axios.isAxiosError(error) && error.response?.status === 429 && retries < maxRetries) {
          this.logger.warn(`Límite de solicitudes (429) de Gemini alcanzado para planta ${plantId}. Reintentando en ${delay / 1000}s...`);
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Duplicar el retraso para el siguiente reintento
        } else {
          this.logger.error(`Error al llamar a la API de Gemini para planta ${plantId}:`, error.response?.data || error.message);
          throw new InternalServerErrorException('Error al procesar el plano con Gemini.');
        }
      }
    }

    if (!geminiResponse) {
        throw new InternalServerErrorException('No se pudo obtener una respuesta válida de Gemini después de varios intentos.');
    }

    // 5. Borrar unidades previas de la planta
    await this.unitRepository.delete({ plant: { id: plantId } });
    this.logger.log(`Unidades existentes eliminadas para la planta ${plantId}.`);

    // 6. Procesar la respuesta de Gemini y guardar las unidades
    const savedUnits: Unit[] = [];
    // Filtra las detecciones válidas (que traen coordinates/polygon)
    const validApartments = (geminiResponse.apartments || []).filter(
        (u: any) => Array.isArray(u?.coordinates) && u.coordinates.length >= 3
    );

    let unitNumberCounter = 1; // Para asignar un número secuencial si Gemini no lo da directamente

    for (const apt of validApartments) {
        const { minX, minY, maxX, maxY } = this.getBoundingBox(apt.coordinates);
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;
        const angle = 0; // Asumimos 0 porque Gemini devuelve polígonos alineados o cajas delimitadoras

        const unit = this.unitRepository.create({
            plant,
            // El campo 'number' es string en la entidad, así que convertimos el número a string.
            // Usamos el ID de Gemini (ej. "apt-01") para derivar el número, o un contador si falla.
            number: (parseInt(apt.id.replace('apt-', '')) || unitNumberCounter++).toString(),
            completed: false,
            // Guardamos 'apt.coordinates' directamente ya que TypeORM maneja 'jsonb' como number[][]
            polygon: apt.coordinates,
            angle,
            width,
            height,
            centerX,
            centerY,
            debugImageUrl: undefined, // Gemini no devuelve una imagen con boxes, el frontend la dibujará
        });
        const savedUnit = await this.unitRepository.save(unit);
        savedUnits.push(savedUnit);
    }

    this.logger.log(`Guardadas ${savedUnits.length} nuevas unidades para la planta ${plantId}.`);

    return {
      plantId,
      count: savedUnits.length,
      // `floorPlanUrl` ahora se devuelve en lugar de un placeholder para la imagen con cajas
      floorPlanUrl: plant.floorPlanUrl,
      units: savedUnits.map(unit => ({
        id: unit.id, // El ID de la unidad en tu DB
        polygon: unit.polygon,
        angle: unit.angle,
        width: unit.width,
        height: unit.height,
        centerX: unit.centerX,
        centerY: unit.centerY,
        completed: unit.completed,
        number: unit.number
      })),
    };
  }

  /**
   * Calcula la caja delimitadora (bounding box) de un conjunto de coordenadas de polígono.
   * @param coordinates Array de puntos [x, y].
   * @returns Objeto con minX, minY, maxX, maxY.
   */
  private getBoundingBox(coordinates: number[][]): { minX: number, minY: number, maxX: number, maxY: number } {
    if (!coordinates || coordinates.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    let minX = coordinates[0][0];
    let minY = coordinates[0][1];
    let maxX = coordinates[0][0];
    let maxY = coordinates[0][1];

    for (const [x, y] of coordinates) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    return { minX, minY, maxX, maxY };
  }
}
