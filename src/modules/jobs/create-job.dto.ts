import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({ description: 'The title of the job' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the job' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'The location of the job' })
  @IsString()
  location: string;

  @ApiProperty({ description: 'The salary for the job' })
  @IsString()
  salary: string;

  @ApiProperty({ description: 'The type of the job (e.g., Full-time, Part-time)' })
  @IsString()
  job_type: string;

  @ApiProperty({ description: 'The name of the company offering the job' })
  @IsString()
  company_name: string;
}
