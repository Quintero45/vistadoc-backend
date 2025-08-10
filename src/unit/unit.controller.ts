import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post('create')
  create(@Body() dto: CreateUnitDto) {
    return this.unitService.create(dto);
  }

  @Get('by-plant/:plantId')
  findByPlant(@Param('plantId') plantId: number) {
    return this.unitService.findByPlant(plantId);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.unitService.delete(id);
  }
}
