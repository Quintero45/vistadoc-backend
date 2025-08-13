// register.dto.ts
import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, DocumentType } from 'src/users/user.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    enum: DocumentType,
    example: DocumentType.CC,
    description: 'Tipo de documento de identificación',
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({
    example: '123456789',
    description: 'Número de identificación (solo números)',
  })
  @Matches(/^[0-9]+$/, {
    message: 'El número de identificación debe contener solo números',
  })
  @MinLength(6, {
    message: 'El número de identificación debe tener al menos 6 dígitos',
  })
  documentNumber: string;

  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico válido',
  })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, {
    message: 'La contraseña debe tener al menos 6 caracteres',
  })
  password: string;

  @ApiProperty({
    example: 'Mi Empresa S.A.S.',
    description: 'Nombre de la empresa asociada',
  })
  @IsString()
  companyName: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'Rol del usuario dentro del sistema',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    example: '3001234567',
    description: 'Número de teléfono (7 a 15 dígitos)',
  })
  @Matches(/^[0-9]{7,15}$/, {
    message:
      'El número de teléfono debe contener entre 7 y 15 dígitos numéricos',
  })
  phone: string;
}
