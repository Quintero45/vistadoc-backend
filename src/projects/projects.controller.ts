// src/projects/projects.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post('create')
  @ApiOperation({ summary: 'Crear proyecto para la compañía del usuario' })
  @ApiCreatedResponse({
    description: 'Proyecto creado',
    schema: {
      example: {
        id: 7,
        name: 'Conjunto Primavera',
        description: 'Etapa 1',
        company: { id: 1 },
        createdAt: '2025-08-13T12:34:56.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    const companyId = req.user?.company?.id;
    return this.projectsService.create(dto, companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-projects')
  @ApiOperation({ summary: 'Listar proyectos de mi compañía' })
  @ApiOkResponse({
    description: 'Listado de proyectos',
    schema: {
      example: [
        { id: 1, name: 'Torre Norte', description: 'Fase A', company: { id: 1 } },
        { id: 2, name: 'Torre Sur', description: 'Fase B', company: { id: 1 } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async getProjects(@Req() req: any) {
    const companyId = req.user.company.id;
    return this.projectsService.findAllByCompany(companyId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un proyecto propio' })
  @ApiParam({ name: 'id', example: 7 })
  @ApiOkResponse({
    description: 'Proyecto actualizado',
    schema: {
      example: {
        id: 7,
        name: 'Conjunto Primavera - actualizado',
        description: 'Etapa 1B',
        company: { id: 1 },
        updatedAt: '2025-08-13T12:45:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const companyId = req.user.company.id;
    return this.projectsService.update(id, dto, companyId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un proyecto propio' })
  @ApiParam({ name: 'id', example: 7 })
  @ApiOkResponse({ description: 'Proyecto eliminado', schema: { example: { deleted: true } } })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async deleteProject(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const companyId = req.user.company.id;
    return this.projectsService.delete(id, companyId);
  }
}
