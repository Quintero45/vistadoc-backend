import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private docRepo: Repository<Document>,
  ) {}

  async upload(dto: CreateDocumentDto) {
    const doc = this.docRepo.create(dto);
    return this.docRepo.save(doc);
  }

  async getByUnit(unitId: number) {
    return this.docRepo.find({
      where: { unit: { id: unitId } },
      order: { uploadedAt: 'DESC' },
    });
  }

  async delete(id: number) {
    const result = await this.docRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No document with ID ${id}`);
    }
  }
}
