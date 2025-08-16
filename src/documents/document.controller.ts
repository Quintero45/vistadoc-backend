// src/documents/document.controller.ts
import {
  Controller, Post, Body, Param, Get, Delete, ParseIntPipe,
  UploadedFile, UseInterceptors, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes,
  ApiCreatedResponse, ApiOkResponse, ApiParam, ApiNoContentResponse, ApiBody
} from '@nestjs/swagger';

@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un documento (PDF) y registrarlo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Envía el PDF en el campo "file".',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        name: { type: 'string', example: 'Plano A-101' },
        unitId: { type: 'number', example: 3 },
      },
      required: ['file', 'name', 'unitId'],
    },
  })
  @ApiCreatedResponse({
    description: 'Documento registrado',
    schema: {
      example: {
        id: 12,
        name: 'Plano A-101',
        url: 'https://res.cloudinary.com/.../a101.pdf',
        unit: { id: 3 },
        uploadedAt: '2025-08-13T12:34:56.000Z',
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateDocumentDto) {
    if (!file) throw new BadRequestException('file (PDF) es requerido');
    return this.documentService.upload(dto, file);
  }

  @Get('by-unit/:unitId')
  @ApiOperation({ summary: 'Listar documentos por unidad' })
  @ApiParam({ name: 'unitId', example: 3 })
  @ApiOkResponse({ description: 'Listado ok' })
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
