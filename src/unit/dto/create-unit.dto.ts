import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty()
  @IsString()
  number: string; // Ej: "225", "302"

  @IsOptional()
  completed?: boolean;

  @IsNotEmpty()
  plant: { id: number }; // Referencia al ID de la planta
}