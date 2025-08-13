// src/projects/dto/create-project.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Torre Norte',
    description: 'Nombre del proyecto',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Av. Siempre Viva 742',
    description: 'Dirección física del proyecto',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    example: 'Primera fase del conjunto residencial',
    description: 'Descripción opcional del proyecto',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://res.cloudinary.com/demo/image/upload/proyecto.jpg',
    description: 'URL de la imagen representativa del proyecto',
  })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
