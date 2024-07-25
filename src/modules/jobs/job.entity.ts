import { AbstractBaseEntity } from '../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Job extends AbstractBaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  salary: string;

  @Column({ nullable: false })
  job_type: string;

  @Column({ nullable: false })
  company_name: string;
}
