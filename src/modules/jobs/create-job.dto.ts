import { IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  location: string;

  @IsString()
  salary: string;

  @IsString()
  job_type: string;

  @IsString()
  company_name: string;
}
