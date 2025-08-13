// src/projects/dto/update-project.dto.ts
import { IsOptional, IsString, IsUrl } from 'class-validator';
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
    example: 'https://res.cloudinary.com/demo/image/upload/proyecto-nuevo.jpg',
    description: 'Nueva URL de imagen representativa del proyecto (opcional)',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'Actualización de la segunda fase del conjunto',
    description: 'Nueva descripción del proyecto (opcional)',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
