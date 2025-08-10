// src/plant/plant.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Plant } from './plant.entity';
import { PlantService } from './plant.service';
import { PlantController } from './plant.controller';

import { Project } from 'src/projects/project.entity';
import { Unit } from 'src/unit/unit.entity';

import { UnitModule } from 'src/unit/unit.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Plant, Project, Unit]),
    // Exporta UnitsDetectorService y UnitService
    UnitModule,
    // Exporta CloudinaryService
    CloudinaryModule,
  ],
  controllers: [PlantController],
  providers: [PlantService],
  exports: [PlantService],
})
export class PlantModule {}
