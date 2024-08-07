import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Job } from './job.entity';

@Entity()
export class JobApplication extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ nullable: false })
  applicant_name: string;

  @ApiProperty()
  @Column({ nullable: false })
  email: string;

  @ApiProperty()
  @Column({ nullable: false })
  resume: string;

  @ApiProperty()
  @Column()
  cover_letter: string;

  @ApiProperty()
  @ManyToOne(() => Job, job => job.job_application)
  job: Job;
}
