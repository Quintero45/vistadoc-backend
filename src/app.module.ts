// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CompaniesModule } from './companies/companies.module';
import { ProjectsModule } from './projects/projects.module';
import { PlantModule } from './plant/plant.module';
import { UnitModule } from './unit/unit.module';
import { DocumentModule } from './documents/document.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // DB: usa DATABASE_URL en prod (Render), .env local en dev
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const useUrl = !!cfg.get<string>('DATABASE_URL'); // si existe, úsala
        return useUrl
          ? {
              type: 'postgres',
              url: cfg.get<string>('DATABASE_URL'),
              autoLoadEntities: true,
              synchronize: false, // prod: migraciones, no sync
              ssl: isProd,
              extra: isProd ? { ssl: { rejectUnauthorized: false } } : undefined,
            }
          : {
              type: 'postgres',
              host: cfg.get<string>('DB_HOST'),
              port: parseInt(cfg.get<string>('DB_PORT') ?? '5432', 10),
              username: cfg.get<string>('DB_USERNAME'),
              password: cfg.get<string>('DB_PASSWORD'),
              database: cfg.get<string>('DB_NAME'),
              autoLoadEntities: true,
              synchronize: true, // solo dev
            };
      },
    }),

    // HTTP para el microservicio de detección (baseURL por env)
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        baseURL: cfg.get<string>('https://unit-detector-vistadoc.onrender.com'), // ej: https://unit-detector.onrender.com
        timeout: 20000,
      }),
    }),

    UsersModule,
    AuthModule,
    CompaniesModule,
    ProjectsModule,
    PlantModule,
    UnitModule,
    DocumentModule,
  ],
})
export class AppModule {}
