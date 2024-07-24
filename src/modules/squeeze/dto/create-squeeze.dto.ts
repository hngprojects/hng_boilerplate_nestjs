import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSqueezeDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  job_title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  referral_source: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  interests: string[];
}
