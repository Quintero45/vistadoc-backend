import { Controller, Post, Body, Param, Get, Delete, ParseIntPipe } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiNoContentResponse,
} from '@nestjs/swagger';

@ApiTags('documents')
@ApiBearerAuth() // quítalo si estos endpoints son públicos
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Registrar un documento asociado (URL/metadata)' })
  @ApiBody({ type: CreateDocumentDto })
  @ApiCreatedResponse({
    description: 'Documento registrado',
    schema: {
      example: {
        id: 12,
        unitId: 3,
        name: 'Plano A-101',
        url: 'https://res.cloudinary.com/.../a101.pdf',
        type: 'PLAN',
        createdAt: '2025-08-13T12:34:56.000Z',
      },
    },
  })
  upload(@Body() dto: CreateDocumentDto) {
    return this.documentService.upload(dto);
  }

  @Get('by-unit/:unitId')
  @ApiOperation({ summary: 'Listar documentos por unidad' })
  @ApiParam({ name: 'unitId', example: 3, description: 'ID de la unidad' })
  @ApiOkResponse({
    description: 'Listado de documentos',
    schema: {
      example: [
        {
          id: 12,
          unitId: 3,
          name: 'Plano A-101',
          url: 'https://res.cloudinary.com/.../a101.pdf',
          type: 'PLAN',
          createdAt: '2025-08-13T12:34:56.000Z',
        },
      ],
    },
  })
  getByUnit(@Param('unitId', ParseIntPipe) unitId: number) {
    return this.documentService.getByUnit(unitId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un documento' })
  @ApiParam({ name: 'id', example: 12 })
  @ApiNoContentResponse({ description: 'Documento eliminado' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.documentService.delete(id);
  }
}
