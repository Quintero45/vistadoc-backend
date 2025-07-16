import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { RequestWithUser } from '../types/request-with-user';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) {}

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    const user = req.user;

    if (!user?.company?.schemaName) {
      return next(); // sin usuario o sin empresa, sigue sin error
    }

    try {
      await this.dataSource.query(`SET search_path TO "${user.company.schemaName}"`);
    } catch (error) {
      console.error('Error al aplicar search_path:', error.message);
    }

    next();
  }
}
