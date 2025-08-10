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
} from '@nestjs/common';
import { PlantService } from './plant.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('plants')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post('create')
  @UseInterceptors(FileInterceptor('floorPlan'))
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreatePlantDto) {
    return this.plantService.create(dto, file);
  }

  @Get('by-project/:projectId')
  findByProject(@Param('projectId') projectId: number) {
    return this.plantService.findByProject(projectId);
  }

  // -------- NUEVO: trigger para detectar unidades --------
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @Post(':id/detect-units')
  detectUnits(@Param('id') id: number) {
    return this.plantService.detectUnits(+id);
  }
}
