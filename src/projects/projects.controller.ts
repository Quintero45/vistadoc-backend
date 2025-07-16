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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from 'src/users/user.entity';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post('create')
  async createProject(@Body() dto: CreateProjectDto, @Req() req: any) {
    const companyId = req.user?.company?.id;
    return this.projectsService.create(dto, companyId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my-projects')
  async getProjects(@Req() req: any) {
    const companyId = req.user.company.id;
    return this.projectsService.findAllByCompany(companyId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Put(':id')
  async updateProject(
    @Param('id') id: number,
    @Body() dto: UpdateProjectDto,
    @Req() req: any,
  ) {
    const companyId = req.user.company.id;
    return this.projectsService.update(+id, dto, companyId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Delete(':id')
  async deleteProject(@Param('id') id: number, @Req() req: any) {
    const companyId = req.user.company.id;
    return this.projectsService.delete(+id, companyId);
  }
}
