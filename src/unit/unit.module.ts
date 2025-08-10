// src/unit/unit.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Unit } from './unit.entity';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { UnitsDetectorService } from './units-detector.service';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  controllers: [UnitController],
  providers: [UnitService, UnitsDetectorService],   // ✅ una sola clave providers
  exports: [UnitService, UnitsDetectorService],     // ✅ una sola clave exports
})
export class UnitModule {}
