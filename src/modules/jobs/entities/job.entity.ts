import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import { JobMode, JobType, SalaryRange } from '../dto/job.dto';

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
}
