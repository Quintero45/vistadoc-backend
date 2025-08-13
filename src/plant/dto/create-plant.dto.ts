import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlantDto {
  @ApiProperty({
    description: 'Nombre de la planta',
    example: 'Piso 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Nivel o número de piso',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  level: number;

  @ApiProperty({
    description: 'ID del proyecto al que pertenece la planta',
    example: 42,
  })
  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @ApiPropertyOptional({
    description: 'URL pública del plano (opcional si se sube archivo)',
    example: 'https://res.cloudinary.com/.../plano.png',
  })
  @IsOptional()
  @IsString()
  floorPlanUrl?: string;
}
