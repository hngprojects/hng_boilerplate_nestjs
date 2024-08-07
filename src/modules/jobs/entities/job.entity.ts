import { ApiHideProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { JobMode, JobType, SalaryRange } from '../dto/job.dto';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { JobApplication } from './job-application.entity';

@Entity()
export class Job extends AbstractBaseEntity {
  @Column('text', { nullable: false })
  title: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('text', { nullable: false })
  location: string;

  @Column({ type: 'timestamp', nullable: false })
  deadline: string;

  @Column({
    type: 'enum',
    enum: SalaryRange,
    nullable: false,
  })
  salary_range: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: 'full-time',
    nullable: false,
  })
  job_type: string;

  @Column({ type: 'enum', enum: JobMode, default: 'remote', nullable: false })
  job_mode: string;

  @Column('text', { nullable: false })
  company_name: string;

  @ApiHideProperty()
  @Column('boolean', { nullable: false, default: false })
  is_deleted: boolean;

  @ApiHideProperty()
  @ManyToOne(() => User, user => user.jobs, { nullable: false })
  user: User;

  @OneToMany(() => JobApplication, job_application => job_application.job)
  job_application: JobApplication[];
}
