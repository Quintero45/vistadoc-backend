import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Project } from 'src/projects/project.entity'; 

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ unique: true })
  nit: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ unique: true })
  schemaName: string;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Project, (project) => project.company)
projects: Project[];


  @BeforeInsert()
  generateSlug() {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '_');
    this.schemaName = this.slug;
  }
}
