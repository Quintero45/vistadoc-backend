import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  upload(@Body() dto: CreateDocumentDto) {
    return this.documentService.upload(dto);
  }

  @Get('by-unit/:unitId')
  getByUnit(@Param('unitId') unitId: number) {
    return this.documentService.getByUnit(unitId);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.documentService.delete(id);
  }
}
