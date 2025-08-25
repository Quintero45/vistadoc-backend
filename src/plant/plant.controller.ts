// src/plant/plant.controller.ts
import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  Body,
  UseInterceptors,
  Param,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
} from '@nestjs/swagger';

//@ApiBearerAuth()
@ApiTags('plants')
@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post('create')
  @UseInterceptors(FileInterceptor('floorPlan'))
  @ApiOperation({ summary: 'Crear una planta (opcionalmente subiendo plano)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Si envías archivo, usa el campo "floorPlan" (binary). Si no, envía solo los campos del DTO con floorPlanUrl.',
    schema: {
      type: 'object',
      properties: {
        floorPlan: { type: 'string', format: 'binary' },
        name: { type: 'string', example: 'Piso 1' },
        level: { type: 'number', example: 1 },
        projectId: { type: 'number', example: 42 },
        floorPlanUrl: {
          type: 'string',
          example: 'https://res.cloudinary.com/.../plano.png',
        },
      },
      required: ['name', 'level', 'projectId'],
    },
  })
  @ApiCreatedResponse({
    description: 'Planta creada',
    schema: {
      example: {
        id: 1,
        name: 'Piso 1',
        level: 1,
        floorPlanUrl: 'https://res.cloudinary.com/.../plano.png',
        project: { id: 42 },
        createdAt: '2025-08-13T12:34:56.000Z',
      },
    },
  })
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreatePlantDto) {
    return this.plantService.create(dto, file);
  }

  @Get('by-project/:projectId')
  @ApiOperation({ summary: 'Listar plantas por proyecto' })
  @ApiParam({ name: 'projectId', example: 42 })
  @ApiOkResponse({
    description: 'Listado de plantas',
    schema: {
      example: [
        {
          id: 1,
          name: 'Piso 1',
          level: 1,
          floorPlanUrl: 'https://res.cloudinary.com/.../plano.png',
          project: { id: 42 },
          createdAt: '2025-08-13T12:34:56.000Z',
        },
      ],
    },
  })
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.plantService.findByProject(projectId);
  }

  // -------- trigger para detector --------
  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post(':id/detect-units')
  @ApiOperation({ summary: 'Detectar unidades en el plano de la planta' })
  @ApiParam({ name: 'id', example: 1, description: 'ID de la planta' })
  @ApiOkResponse({
    description: 'Detecciones realizadas',
    schema: {
      example: {
        plantId: 1,
        count: 30,
        floorPlanUrl: 'https://res.cloudinary.com/.../plano_analizado.png', // Ahora se devuelve la URL del plano original
        units: [
          {
            id: 10,
            number: "101", // Example: "101" as per Unit entity's string type
            polygon: [
              [403, 248],
              [447, 248],
              [447, 271],
              [403, 271],
            ],
            angle: 0, // Actualizado a 0
            width: 23,
            height: 44,
            centerX: 425,
            centerY: 259.5,
            completed: false,
          },
        ],
      },
    },
  })
  async detectUnits(@Param('id', ParseIntPipe) id: number) {
    return this.plantService.detectUnits(id);
  }
}
