// src/unit/unit.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Plant } from '../plant/plant.entity';
import { Document } from '../documents/document.entity';

@Entity()
export class Unit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  number?: string; // El usuario la asignará luego

  @Column({ default: false })
  completed: boolean;

  // --- Geometría/detección ---
  @Column({ type: 'jsonb', nullable: true })
  polygon?: number[][]; // [[x1,y1],[x2,y2]...]

  @Column('float', { nullable: true })
  angle?: number;

  @Column('float', { nullable: true })
  width?: number;

  @Column('float', { nullable: true })
  height?: number;

  @Column('float', { nullable: true })
  centerX?: number;

  @Column('float', { nullable: true })
  centerY?: number;

  @Column({ nullable: true })
  debugImageUrl?: string;

  @ManyToOne(() => Plant, (plant) => plant.units, { onDelete: 'CASCADE' })
  plant: Plant;

  @OneToMany(() => Document, (document) => document.unit, { cascade: true })
  documents: Document[];
}
