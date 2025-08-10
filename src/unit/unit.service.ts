import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from './unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepo: Repository<Unit>,
  ) {}

  async create(dto: CreateUnitDto) {
    const unit = this.unitRepo.create(dto);
    return this.unitRepo.save(unit);
  }

  async findByPlant(plantId: number) {
    return this.unitRepo.find({
      where: { plant: { id: plantId } },
      relations: ['documents'],
    });
  }

  async delete(id: number) {
    const result = await this.unitRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`No unit with ID ${id}`);
    }
  }
}
