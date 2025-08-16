// src/documents/document.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document) private readonly docRepo: Repository<Document>,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async upload(dto: CreateDocumentDto, file: Express.Multer.File) {
    // 1) subir a Cloudinary como raw (PDF)
    const uploaded = await this.cloudinary.uploadDocuments(file);

    // 2) persistir
    const doc = this.docRepo.create({
      name: dto.name,
      url: uploaded.secure_url,
      unit: { id: dto.unitId } as any,
    });

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
