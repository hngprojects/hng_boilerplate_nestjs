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
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  @IsNotEmpty()
  deadline: string;

  @IsEnum(SalaryRange)
  @IsNotEmpty()
  salary_range: SalaryRange;

  @IsEnum(JobType)
  @IsOptional()
  job_type: JobType;

  @IsEnum(JobMode)
  @IsOptional()
  job_mode: JobMode;
  @IsString()
  @IsNotEmpty()
  company_name: string;

  @IsBoolean()
  @IsOptional()
  is_deleted: boolean;
}
