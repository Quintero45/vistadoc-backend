import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Nombre descriptivo del documento',
    example: 'Plano A-101',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL pública del archivo en Firebase o Cloudinary',
    example: 'https://res.cloudinary.com/demo/image/upload/v1234567/plano-a101.pdf',
  })
  @IsNotEmpty()
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Objeto con el ID de la unidad a la que pertenece el documento',
    example: { id: 3 },
  })
  @IsNotEmpty()
  unit: { id: number };
}
