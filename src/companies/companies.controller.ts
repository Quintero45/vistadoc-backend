import { Body, Controller, Get, Post } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('companies')
@ApiBearerAuth() // quítalo si este recurso es público
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post('create')
  @ApiOperation({ summary: 'Crear una nueva empresa' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiCreatedResponse({
    description: 'Empresa registrada exitosamente',
    schema: {
      example: {
        message: 'Empresa registrada exitosamente',
        slug: 'mi-empresa-sas',
        schema: 'tenant_mi_empresa_sas',
      },
    },
  })
  async createCompany(@Body() dto: CreateCompanyDto) {
    const company = await this.companiesService.create(dto);
    return {
      message: 'Empresa registrada exitosamente',
      slug: company.slug,
      schema: company.schemaName,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Listar todas las empresas' })
  @ApiOkResponse({
    description: 'Listado de empresas',
    schema: {
      example: [
        {
          id: 1,
          name: 'Mi Empresa S.A.S.',
          slug: 'mi-empresa-sas',
          schemaName: 'tenant_mi_empresa_sas',
          createdAt: '2025-08-13T07:57:58.357Z',
        },
        {
          id: 2,
          name: 'Otra Empresa',
          slug: 'otra-empresa',
          schemaName: 'tenant_otra_empresa',
          createdAt: '2025-08-12T12:34:56.000Z',
        },
      ],
    },
  })
  async getAllCompanies() {
    return this.companiesService.findAll();
  }
}
