import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsBoolean, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

// Enum definitions for clarity
enum SalaryRange {
  'below_30k' = 'below_30k',
  '30k_to_50k' = '30k_to_50k',
  '50k_to_70k' = '50k_to_70k',
  '70k_to_100k' = '70k_to_100k',
  '100k_to_150k' = '100k_to_150k',
  'above_150k' = 'above_150k',
}

enum JobType {
  FullTime = 'full-time',
  PartTime = 'part-time',
  Internship = 'internship',
  Contract = 'contract',
}

enum JobMode {
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
    example: SalaryRange['30K_to_50K'],
    required: true,
  })
  @IsEnum(SalaryRange)
  @IsNotEmpty()
  salary_range: SalaryRange;

  @ApiProperty({
    description: 'The type of job',
    enum: JobType,
    example: JobType['full_time'],
    required: true,
  })
  @IsEnum(JobType)
  @IsOptional()
  job_type: JobType;

  @ApiProperty({
    description: 'The mode of the job (e.g., remote, onsite)',
    enum: JobMode,
    example: JobMode['remote'],
    required: true,
  })
  @IsEnum(JobMode)
  @IsOptional()
  job_mode: JobMode;

  @ApiProperty({
    description: 'The name of the company offering the job',
    example: 'Tech Corp',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @ApiHideProperty()
  @IsBoolean()
  @IsOptional()
  is_deleted: boolean;
}
