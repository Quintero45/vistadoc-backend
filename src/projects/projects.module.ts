import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './project.entity';
import { Company } from 'src/companies/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Company])],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
