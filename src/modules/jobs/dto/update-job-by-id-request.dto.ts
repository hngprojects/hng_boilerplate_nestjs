import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsDefined, IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { JobMode, JobType, SalaryRange } from './job.dto';

export class UpdateJobByIdRequestDto {
  @ApiProperty({
    description: 'The title of the job',
    example: 'Software Engineer',
    required: false,
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({
    description: 'A detailed description of the job',
    example: 'Responsible for developing and maintaining web applications.',
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    description: 'The location of the job',
    example: 'New York, NY',
    required: false,
  })
  @IsString()
  @IsOptional()
  location: string;

  @ApiProperty({
    description: 'The deadline for the job application',
    example: '2024-12-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  deadline: string;

  @ApiProperty({
    description: 'The salary range for the job',
    enum: SalaryRange,
    example: SalaryRange['30K_to_50K'],
    required: false,
  })
  @IsEnum(SalaryRange)
  @IsOptional()
  salary_range: string;

  @ApiProperty({
    description: 'The type of job',
    enum: JobType,
    example: JobType['full_time'],
    required: false,
  })
  @IsEnum(JobType)
  @IsOptional()
  job_type: string;

  @ApiProperty({
    description: 'The mode of the job (e.g., remote, onsite)',
    enum: JobMode,
    example: JobMode['remote'],
    required: false,
  })
  @IsEnum(JobMode)
  @IsOptional()
  job_mode: string;

  @ApiProperty({
    description: 'The name of the company offering the job',
    example: 'Tech Corp',
    required: false,
  })
  @IsString()
  @IsOptional()
  company_name: string;

  @ApiProperty({
    description: 'The deleted status of the job',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  is_deleted: boolean;

  @ApiHideProperty()
  @ValidateIf(
    o =>
      !o.title ||
      !o.description ||
      !o.location ||
      !o.deadline ||
      !o.salary_range ||
      !o.job_type ||
      !o.job_mode ||
      !o.company_name ||
      !o.is_deleted
  )
  @IsDefined({
    message:
      'At least one of the following fields must be provided: [title, description, location, deadline, salary_range, job_type, job_mode, company_name, is_deleted]',
  })
  isDefined: undefined;
}
