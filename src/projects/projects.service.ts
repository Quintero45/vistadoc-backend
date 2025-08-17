// src/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Project } from './project.entity';
import { Company } from 'src/companies/company.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Company) private readonly companyRepo: Repository<Company>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(
    dto: CreateProjectDto,
    companyId: number,
    file?: Express.Multer.File,
  ) {
    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) throw new NotFoundException('Compañía no encontrada');

    let imageUrl = dto.imageUrl ?? undefined;

    // Si llega archivo en el campo "image", súbelo a Cloudinary
    if (file) {
      const res = await this.cloudinary.uploadProjectImage(file); // <-- usa el método para imágenes
      imageUrl = res.secure_url;
    }

    const project = this.projectRepo.create({
      ...dto,
      imageUrl,
      company,
    });

    return this.projectRepo.save(project);
  }

  async findAllByCompany(companyId: number) {
  return this.projectRepo.find({
    where: { company: { id: companyId } },
    relations: ['company'],
  });
}

  async update(projectId: number, dto: UpdateProjectDto, companyId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, company: { id: companyId } },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async delete(projectId: number, companyId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, company: { id: companyId } },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');

    await this.projectRepo.remove(project);
    return { deleted: true };
  }
}
