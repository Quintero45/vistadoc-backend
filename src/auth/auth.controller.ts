import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const exists = await this.authService.userExists(registerDto.email);
    if (exists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const user = await this.authService.register(registerDto);
    return this.authService.login(user); // opcional: retornar token después de registrar
  }
}
