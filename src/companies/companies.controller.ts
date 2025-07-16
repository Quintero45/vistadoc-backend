import { Body, Controller, Get, Post } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('create')
  async createCompany(@Body() dto: CreateCompanyDto) {
    const company = await this.companiesService.create(dto);
    return {
      message: 'Empresa registrada exitosamente',
      slug: company.slug,
      schema: company.schemaName,
    };
  }

  @Get('all')
  async getAllCompanies() {
    return this.companiesService.findAll();
  }
}
