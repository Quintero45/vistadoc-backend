import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  url: string; // URL pública del archivo en Firebase o Cloudinary

  @IsNotEmpty()
  unit: { id: number }; // Referencia al ID de la unidad
}