import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { JobMode, JobType, SalaryRange } from '../dto/job.dto';

@Entity()
export class Job extends AbstractBaseEntity {
  @ApiProperty({ description: 'The title of the job', example: 'Software Engineer' })
  @Column('text', { nullable: false })
  title: string;

  @ApiProperty({ description: 'A brief description of the job', example: 'Develop and maintain web applications.' })
  @Column('text', { nullable: false })
  description: string;

  @ApiProperty({ description: 'Location where the job is based', example: 'New York, NY' })
  @Column('text', { nullable: false })
  location: string;

  @ApiProperty({ description: 'Deadline for the job application', example: '2024-12-31T23:59:59Z' })
  @Column({ type: 'timestamp', nullable: false })
  deadline: string;

  @ApiProperty({ description: 'Salary range for the job', example: '50,000 - 70,000' })
  @Column({
    type: 'enum',
    enum: SalaryRange,
    nullable: false,
  })
  salary_range: string;

  @ApiProperty({ description: 'Type of the job', example: 'full-time', enum: JobType })
  @Column({
    type: 'enum',
    enum: JobType,
    default: 'full-time',
    nullable: false,
  })
  job_type: string;

  @ApiProperty({ description: 'Mode of the job', example: 'remote', enum: JobMode })
  @Column({ type: 'enum', enum: JobMode, default: 'remote', nullable: false })
  job_mode: string;

  @ApiProperty({ description: 'Name of the company offering the job', example: 'Tech Innovations Inc.' })
  @Column('text', { nullable: false })
  company_name: string;

  @ApiHideProperty()
  @Column('boolean', { nullable: false, default: false })
  is_deleted: boolean;

  @ApiHideProperty()
  @ManyToOne(() => User, user => user.jobs, { nullable: false })
  user: User;

  // New properties with API docs

  @ApiProperty({
    description: 'List of qualifications required for the job',
    example: ["Bachelor's Degree in Computer Science", '5 years of experience in software development'],
    type: [String],
    nullable: true,
  })
  @Column('text', { array: true, nullable: true })
  qualifications: string[];

  @ApiProperty({
    description: 'List of key responsibilities for the job',
    example: ['Develop software solutions', 'Collaborate with cross-functional teams'],
    type: [String],
    nullable: true,
  })
  @Column('text', { array: true, nullable: true })
  key_responsibilities: string[];

  @ApiProperty({
    description: 'List of benefits associated with the job',
    example: ['Health insurance', '401(k) matching', 'Paid time off'],
    type: [String],
    nullable: true,
  })
  @Column('text', { array: true, nullable: true })
  benefits: string[];

  @ApiProperty({
    description: 'Required or preferred experience level for the job',
    example: 'Senior Developer',
    nullable: true,
  })
  @Column('text', { nullable: true })
  experience_level: string;
}
