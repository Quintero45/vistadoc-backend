import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreatePlantDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  level: number;

  @IsNotEmpty()
  @IsNumber()
  projectId: number;

  @IsOptional()
  @IsString()
  floorPlanUrl?: string;

}
