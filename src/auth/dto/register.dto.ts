import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { UserRole, DocumentType } from 'src/users/user.entity';

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @Matches(/^[0-9]+$/, { message: 'El número de identificación debe contener solo números' })
  @MinLength(6, { message: 'El número de identificación debe tener al menos 6 dígitos' })
  documentNumber: string;

  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  companyName: string;

  @IsEnum(UserRole)
  role: UserRole;

  @Matches(/^[0-9]{7,15}$/, { message: 'El número de teléfono debe contener entre 7 y 15 dígitos numéricos' })
  phone: string;
}
