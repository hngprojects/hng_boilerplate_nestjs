import { IsNotEmpty, isString } from 'class-validator';

export class CreateJobDTO {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  location: string;

  @IsNotEmpty()
  job_type: string;

  @IsNotEmpty()
  salary: string;

  @IsNotEmpty()
  organisation: string;
}
