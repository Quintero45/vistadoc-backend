import { IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Mi Empresa S.A.S.',
    description: 'Nombre legal de la empresa',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '900123456',
    description: 'Número de identificación tributaria (NIT) de la empresa',
    minLength: 6,
    maxLength: 15,
  })
  @Matches(/^[0-9]{6,15}$/, {
    message: 'NIT inválido, debe contener entre 6 y 15 dígitos',
  })
  nit: string;

  @ApiProperty({
    example: 'Calle 123 #45-67',
    description: 'Dirección física de la empresa',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 'Bogotá',
    description: 'Ciudad donde está ubicada la empresa',
  })
  @IsString()
  city: string;

  @ApiProperty({
    example: '6012345678',
    description: 'Número de teléfono de contacto',
    minLength: 7,
    maxLength: 15,
  })
  @Matches(/^[0-9]{7,15}$/, {
    message: 'El teléfono debe contener entre 7 y 15 números',
  })
  phone: string;

  @ApiProperty({
    example: 'https://misitio.com/logo.png',
    description:
      'URL del logo de la empresa. Si no hay logo aún, usar un placeholder',
  })
  @IsString()
  logoUrl: string;
}
