import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/user.entity';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }
  async validate(payload: any): Promise<User> {
    const user = await this.usersService.findById(payload.sub, {
      relations: ['company'],
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }
}
