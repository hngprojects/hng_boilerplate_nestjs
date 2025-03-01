import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsArray } from 'class-validator';
import { JobMode, JobType, SalaryRange } from './job.dto';

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: 'The title of the job',
    example: 'Senior Software Engineer',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the job',
    example: 'We are looking for an experienced developer...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The location of the job',
    example: 'New York, NY',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'The deadline for applications',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({
    description: 'The salary range',
    enum: SalaryRange,
  })
  @IsOptional()
  @IsEnum(SalaryRange)
  salary_range?: string;

  @ApiPropertyOptional({
    description: 'The type of job',
    enum: JobType,
  })
  @IsOptional()
  @IsEnum(JobType)
  job_type?: string;

  @ApiPropertyOptional({
    description: 'The mode of work',
    enum: JobMode,
  })
  @IsOptional()
  @IsEnum(JobMode)
  job_mode?: string;

  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Tech Corp',
  })
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiPropertyOptional({
    description: 'Required qualifications',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  qualifications?: string[];

  @ApiPropertyOptional({
    description: 'Key responsibilities',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  key_responsibilities?: string[];

  @ApiPropertyOptional({
    description: 'Job benefits',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiPropertyOptional({
    description: 'Required experience level',
    example: 'Senior',
  })
  @IsOptional()
  @IsString()
  experience_level?: string;
}
