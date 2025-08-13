import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Inicia sesión y obtiene JWT' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 1, email: 'user@mail.com', name: 'User' },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registra usuario y devuelve JWT' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'Registro exitoso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 1, email: 'new@mail.com', name: 'Nuevo Usuario' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'El correo ya está registrado' })
  async register(@Body() registerDto: RegisterDto) {
    const exists = await this.authService.userExists(registerDto.email);
    if (exists) {
      throw new BadRequestException('El correo ya está registrado');
    }
    const user = await this.authService.register(registerDto);
    // Opcional: podrías devolver solo el usuario si no quieres token inmediato
    return this.authService.login(user);
  }
}
