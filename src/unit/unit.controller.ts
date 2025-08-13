import { Controller, Post, Body, Param, Get, Delete, ParseIntPipe } from '@nestjs/common';
import { UnitService } from './unit.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('units')
@ApiBearerAuth() // quítalo si estas rutas son públicas
@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear una unidad' })
  @ApiCreatedResponse({
    description: 'Unidad creada',
    schema: {
      example: {
        id: 101,
        number: null,
        completed: false,
        polygon: [
          [403, 248],
          [447, 248],
          [447, 271],
          [403, 271],
        ],
        angle: 90,
        width: 23,
        height: 44,
        centerX: 425,
        centerY: 259.5,
        plant: { id: 1 },
        createdAt: '2025-08-13T12:34:56.000Z',
      },
    },
  })
  create(@Body() dto: CreateUnitDto) {
    return this.unitService.create(dto);
  }

  @Get('by-plant/:plantId')
  @ApiOperation({ summary: 'Listar unidades por planta' })
  @ApiParam({ name: 'plantId', example: 1, description: 'ID de la planta' })
  @ApiOkResponse({
    description: 'Listado de unidades de la planta',
    schema: {
      example: [
        {
          id: 101,
          number: null,
          completed: false,
          polygon: [
            [403, 248],
            [447, 248],
            [447, 271],
            [403, 271],
          ],
          angle: 90,
          width: 23,
          height: 44,
          centerX: 425,
          centerY: 259.5,
          plant: { id: 1 },
          createdAt: '2025-08-13T12:34:56.000Z',
        },
      ],
    },
  })
  findByPlant(@Param('plantId', ParseIntPipe) plantId: number) {
    return this.unitService.findByPlant(plantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una unidad' })
  @ApiParam({ name: 'id', example: 101 })
  @ApiNoContentResponse({ description: 'Unidad eliminada' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.unitService.delete(id);
  }
}
