import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { JobMode, JobType, SalaryRange } from '../dto/job.dto';
import { Type } from 'class-transformer';

export class JobSearchDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(SalaryRange)
  salary_range?: SalaryRange;

  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @IsOptional()
  @IsEnum(JobMode)
  job_mode?: JobMode;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
// export { JobMode };
