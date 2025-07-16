import { Entity, PrimaryGeneratedColumn, Column , JoinColumn} from 'typeorm';
import { ManyToOne } from 'typeorm';
import { Company } from 'src/companies/company.entity';

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  COLABORADOR = 'colaborador',
}

export enum DocumentType {
  CC = 'CC',         // Cédula de ciudadanía
  CE = 'CE',         // Cédula de extranjería
  NIT = 'NIT',       // Número de identificación tributaria
  PASSPORT = 'PASSPORT',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ unique: true })
  documentNumber: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @ManyToOne(() => Company, (company) => company.users, { eager: true })
  @JoinColumn({ name: 'company_id' }) // crea la FK company_id en la tabla User
  company: Company;


  @Column({ type: 'enum', enum: UserRole, default: UserRole.COLABORADOR })
  role: UserRole;
}
