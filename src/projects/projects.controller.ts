// src/projects/projects.controller.ts
import {
  Controller, Post, Body, UseGuards, Req, Get, Put, Param, Delete,
  ParseIntPipe, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse, ApiOkResponse,
  ApiParam, ApiForbiddenResponse, ApiUnauthorizedResponse, ApiConsumes, ApiBody
} from '@nestjs/swagger';

//@ApiBearerAuth()
@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  //@ApiUnauthorizedResponse({ description: 'No autenticado' })
  //@ApiForbiddenResponse({ description: 'Sin permisos' })
  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Crear proyecto (opcionalmente subiendo imagen)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description:
      'Si envías archivo, usa el campo "image" (binary). Si no, pasa imageUrl en el body.',
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
        name: { type: 'string', example: 'Conjunto Primavera' },
        address: { type: 'string', example: 'Av. Siempre Viva 742' },
        description: { type: 'string', example: 'Etapa 1' },
        imageUrl: {
          type: 'string',
          example: 'https://res.cloudinary.com/demo/image/upload/proy.jpg',
        },
      },
      required: ['name', 'address'],
    },
  })
  @ApiCreatedResponse({
    description: 'Proyecto creado',
    schema: {
      example: {
        id: 7,
        name: 'Conjunto Primavera',
        address: 'Av. Siempre Viva 742',
        description: 'Etapa 1',
        imageUrl: 'https://res.cloudinary.com/.../proyectos/abc.jpg',
        company: { id: 1 },
        createdAt: '2025-08-13T12:34:56.000Z',
      },
    },
  })
  async createProject(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProjectDto,
    @Req() req: any,
  ) {
    const companyId = req.user?.company?.id;
    return this.projectsService.create(dto, companyId, file);
  }

  // NUEVO: sin AuthGuard, recibe companyId por ruta
  @Get('by-company/:companyId')
  @ApiOperation({ summary: 'Listar proyectos por companyId (sin token)' })
  @ApiParam({ name: 'companyId', example: 1 })
  getByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.projectsService.findAllByCompany(companyId);
  }


  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un proyecto propio' })
  @ApiParam({ name: 'id', example: 7 })
  @ApiOkResponse({ description: 'Proyecto actualizado' })
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

  //@UseGuards(AuthGuard('jwt'), RolesGuard)
  //@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
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
