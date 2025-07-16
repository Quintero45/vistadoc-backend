import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private companiesService: CompaniesService, // ✅ inyectamos el servicio
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Contraseña incorrecta');

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
  const payload = {
    sub: user.id,
    role: user.role,
    email: user.email,
    company: {
      id: user.company.id,
    },
  };

  return {
    access_token: this.jwtService.sign(payload),
    user,
  };
}


  async register(registerDto: RegisterDto) {
    const generatedSlug = registerDto.companyName
      .toLowerCase()
      .replace(/\s+/g, '_');

    const company = await this.companiesService.findBySlug(generatedSlug);
    if (!company) {
      throw new BadRequestException('La empresa no existe');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.usersService.create({
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      documentType: registerDto.documentType,
      documentNumber: registerDto.documentNumber,
      email: registerDto.email,
      phone: registerDto.phone,
      password: hashedPassword,
      role: registerDto.role,
      company: company, // ✅ ahora es la entidad completa
    });

    const { password: _, ...result } = user;
    return result;
  }

  async userExists(email: string) {
    const user = await this.usersService.findByEmail(email);
    return !!user;
  }
}
