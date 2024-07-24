import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';

@Entity()
export class Job extends AbstractBaseEntity {
  @Column({ nullable: false, unique: true })
  title: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  salary: string;

  @Column({ nullable: false })
  job_type: string;

  @ManyToOne(() => Organisation, organisation => organisation.jobs, { nullable: true })
  organisation: Organisation;
}
