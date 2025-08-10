import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Unit } from '../unit/unit.entity';

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ej: "Prueba hidráulica.pdf"

  @Column()
  url: string; // URL pública del archivo en Firebase o Cloudinary

  @ManyToOne(() => Unit, (unit) => unit.documents, { onDelete: 'CASCADE' })
  unit: Unit;

  @CreateDateColumn()
  uploadedAt: Date;
}
