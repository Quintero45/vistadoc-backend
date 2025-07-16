import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Company } from 'src/companies/company.entity';

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
}
