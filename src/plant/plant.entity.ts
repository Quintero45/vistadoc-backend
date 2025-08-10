import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { Unit } from '../unit/unit.entity';

@Entity()
export class Plant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: number;

  @Column({ nullable: true })
  floorPlanUrl?: string;


  @ManyToOne(() => Project, (project) => project.plants)
  project: Project;

  @OneToMany(() => Unit, (unit) => unit.plant, { cascade: true })
  units: Unit[];

  @CreateDateColumn()
  createdAt: Date;
}
