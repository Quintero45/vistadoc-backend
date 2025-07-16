// src/projects/projects.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { Company } from 'src/companies/company.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async create(dto: CreateProjectDto, company: Company) {
    const project = this.projectRepo.create({ ...dto, company });
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

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async delete(projectId: number, companyId: number) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, company: { id: companyId } },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    await this.projectRepo.remove(project);
    return { message: 'Proyecto eliminado correctamente' };
  }
}
