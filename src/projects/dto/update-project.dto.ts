// src/projects/dto/update-project.dto.ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    example: 'Torre Norte Renovada',
    description: 'Nuevo nombre del proyecto (opcional)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Calle 50 #12-34',
    description: 'Nueva dirección del proyecto (opcional)',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Nueva imagen para el proyecto (opcional)',
  })
  @IsOptional()
  imageUrl?: any; // Archivo que recibimos vía multipart/form-data

  @ApiPropertyOptional({
    example: 'Actualización de la segunda fase del conjunto',
    description: 'Nueva descripción del proyecto (opcional)',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
