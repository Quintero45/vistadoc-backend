// src/projects/dto/create-project.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  imageUrl?: string;
}
