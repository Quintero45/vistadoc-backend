// src/documents/dto/create-document.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Nombre del documento', example: 'Plano A-101' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'ID de la unidad', example: 3 })
  @IsNotEmpty()
  @IsNumber()
  unitId: number;
}
