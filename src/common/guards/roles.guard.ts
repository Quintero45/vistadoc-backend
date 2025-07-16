import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/users/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );

    // 👇 Si NO hay @Roles() en el handler, permitir el acceso
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 👇 Si se requiere rol pero el usuario no está autenticado
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // 👇 Si el usuario no tiene uno de los roles requeridos
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    return true;
  }
}

