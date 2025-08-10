import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Company } from 'src/companies/company.entity';
import { Plant } from 'src/plant/plant.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  imageUrl: string;

  @ManyToOne(() => Company, (company) => company.projects)
  company: Company;

  @OneToMany(() => Plant, (plant) => plant.project) // 👈 Esto es lo que TypeORM no encuentra
  plants: Plant[];
}
