import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsNotEmpty, IsOptional, IsDateString, IsArray } from 'class-validator';

export enum SalaryRange {
  'below_30k' = 'below_30k',
  '30k_to_50k' = '30k_to_50k',
  '50k_to_70k' = '50k_to_70k',
  '70k_to_100k' = '70k_to_100k',
  '100k_to_150k' = '100k_to_150k',
  'above_150k' = 'above_150k',
}

export enum JobType {
  FullTime = 'full-time',
  PartTime = 'part-time',
  Internship = 'internship',
  Contract = 'contract',
}

export enum JobMode {
  Remote = 'remote',
  Onsite = 'onsite',
}

export class JobDto {
  @ApiProperty({
    description: 'The title of the job',
    example: 'Software Engineer',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'A detailed description of the job',
    example: 'Responsible for developing and maintaining web applications.',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The location of the job',
    example: 'New York, NY',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'The deadline for the job application',
    example: '2024-12-31T23:59:59Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({
    description: 'The salary range for the job',
    enum: SalaryRange,
    type: String,
    example: SalaryRange['30k_to_50k'],
    required: true,
  })
  @IsEnum(SalaryRange)
  @IsNotEmpty()
  salary_range: string;

  @ApiProperty({
    description: 'The type of job',
    enum: JobType,
    type: String,
    example: JobType.FullTime,
    required: true,
  })
  @IsEnum(JobType)
  @IsNotEmpty()
  job_type: string;

  @ApiProperty({
    description: 'The mode of the job (e.g., remote, onsite)',
    enum: JobMode,
    type: String,
    example: JobMode.Remote,
    required: true,
  })
  @IsEnum(JobMode)
  @IsNotEmpty()
  job_mode: string;

  @ApiProperty({
    description: 'The name of the company offering the job',
    example: 'Tech Corp',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiProperty({
    description: 'List of qualifications required for the job',
    example: ["Bachelor's Degree in Computer Science", '5+ years of experience in software development'],
    type: [String],
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  qualifications?: string[];

  @ApiProperty({
    description: 'List of key responsibilities for the job',
    example: ['Develop and maintain web applications', 'Collaborate with cross-functional teams'],
    type: [String],
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  key_responsibilities?: string[];

  @ApiProperty({
    description: 'List of benefits associated with the job',
    example: ['Health insurance', '401(k) matching', 'Paid time off'],
    type: [String],
    nullable: true,
  })
  @IsArray()
  @IsOptional()
  benefits?: string[];

  @ApiProperty({
    description: 'Required or preferred experience level for the job',
    example: 'Senior',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  experience_level?: string;

  @ApiHideProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted?: boolean;
}
