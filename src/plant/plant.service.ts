// src/plant/plant.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plant } from './plant.entity';
import { CreatePlantDto } from './dto/create-plant.dto';
import { Project } from 'src/projects/project.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

import { Unit } from 'src/unit/unit.entity';
import { UnitsDetectorService } from 'src/unit/units-detector.service';

@Injectable()
export class PlantService {
  constructor(
    @InjectRepository(Plant)
    private readonly plantRepository: Repository<Plant>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    private readonly cloudinaryService: CloudinaryService,
    private readonly detector: UnitsDetectorService,
  ) {}

  async create(dto: CreatePlantDto, file?: Express.Multer.File): Promise<Plant> {
    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    let uploadedUrl: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadPdf(file);
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
   * Detectar unidades con el microservicio y guardarlas.
   * Nota: Para MVP, solo creamos Units con `completed=false` y sin número.
   * Si tu entidad Unit NO tiene columnas como polygon/angle/width/height/centerX/centerY,
   * no las asignamos aquí para evitar errores de compilación.
   */
  // src/plant/plant.service.ts  -> dentro de PlantService
async detectUnits(plantId: number) {
  const plant = await this.plantRepository.findOne({ where: { id: plantId } });
  if (!plant) throw new NotFoundException('Planta no encontrada');
  if (!plant.floorPlanUrl) throw new NotFoundException('La planta no tiene floorPlanUrl');

  // Llamar al microservicio
  const result = await this.detector.detectFromImageUrl(plant.floorPlanUrl);
  const { units = [], image_with_boxes } = result || {};

  // Borrar unidades previas del plant (MVP)
  await this.unitRepository.delete({ plant: { id: plantId } });

  // Solo las detecciones válidas (que traen polygon)
  const valid = (units as any[]).filter(
    (u) => Array.isArray(u?.polygon) && u.polygon.length >= 3
  );

  // Mapear TODOS los campos a la entidad Unit
  const toSave = valid.map((u: any) =>
    this.unitRepository.create({
      plant,
      number: undefined,          // el usuario la asignará luego
      completed: false,

      polygon: u.polygon,         // [[x,y], [x,y], ...]
      angle: u.angle ?? null,
      width: u.width ?? null,
      height: u.height ?? null,
      centerX: u.center?.x ?? null,
      centerY: u.center?.y ?? null,
      debugImageUrl: image_with_boxes ?? null,
    }),
  );

  const saved = await this.unitRepository.save(toSave);

  return {
    plantId,
    count: saved.length,
    image_with_boxes,
    detections: units, // crudas (por si el front las usa)
    units: saved,      // ya persistidas con polygon/angle/...
  };
}

}
