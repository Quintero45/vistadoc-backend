// src/cloudinary/cloudinary.service.ts
import { Injectable } from '@nestjs/common';
// ✅ IMPORTA SIEMPRE la instancia configurada
import { cloudinary } from './cloudinary.config';
import { extname, basename } from 'path';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {

  // PDF/Documentos (raw)
async uploadDocuments(file: Express.Multer.File): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    // 👇 Obtener el nombre sin extensión
    const originalName = basename(file.originalname, extname(file.originalname));

    cloudinary.uploader
      .upload_stream(
        {
          resource_type: 'auto',
          folder: 'vistadoc/documents',
          format: 'pdf',
          public_id: originalName, // 👈 usar nombre del archivo
          overwrite: true,         // 👈 sobreescribir si ya existe
        },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          if (error) return reject(error);
          resolve(result);
        },
      )
      .end(file.buffer);
  });
}


  // imagen/plano (PNF/JPG) (image)
  async uploadPlantImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'vistadoc/plant' },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  // Imagen de proyecto (image)
  async uploadProjectImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: 'image', folder: 'vistadoc/projects' },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }
}
