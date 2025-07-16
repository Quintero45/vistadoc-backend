import { IsString, Matches, MinLength } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @Matches(/^[0-9]{6,15}$/, {
    message: 'NIT inválido, debe contener entre 6 y 15 dígitos',
  })
  nit: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @Matches(/^[0-9]{7,15}$/, {
    message: 'El teléfono debe contener entre 7 y 15 números',
  })
  phone: string;

  @IsString()
  logoUrl: string; // si no hay logo aún, puedes enviar un placeholder
}
