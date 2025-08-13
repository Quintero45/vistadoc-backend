import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Número o identificador de la unidad',
    example: '302B',
  })
  @IsNotEmpty()
  @IsString()
  number: string; // Ej: "225", "302"

  @ApiPropertyOptional({
    description: 'Indica si la unidad ya está completada',
    example: false,
  })
  @IsOptional()
  completed?: boolean;

  @ApiProperty({
    description: 'Objeto con el ID de la planta asociada',
    example: { id: 1 },
  })
  @IsNotEmpty()
  plant: { id: number }; // Referencia al ID de la planta
}
