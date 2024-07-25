import { AbstractBaseEntity } from '../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Job extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  location: string;

  @Column()
  salary: string;

  @Column()
  job_type: string;

  @Column()
  company_name: string;
}
