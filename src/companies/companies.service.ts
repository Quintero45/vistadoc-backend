import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private dataSource: DataSource, // ✅ inyectamos DataSource
  ) {}

  async findBySlug(slug: string): Promise<Company | undefined> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    return company ?? undefined;
  }

  async create(data: Partial<Company>): Promise<Company> {
    const company = this.companyRepository.create(data);
    const saved = await this.companyRepository.save(company);

    // ✅ Crea el schema si no existe
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${saved.schemaName}"`);

    return saved;
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }
}
