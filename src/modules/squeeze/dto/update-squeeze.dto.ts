import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

export class UpdateSqueezeDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly first_name: string;

  @IsString()
  @IsOptional()
  readonly last_name: string;

  @IsString()
  @IsOptional()
  readonly phone: string;

  @IsString()
  @IsOptional()
  readonly location: string;

  @IsString()
  @IsOptional()
  readonly job_title: string;

  @IsString()
  @IsOptional()
  readonly company: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  readonly interests: string[];

  @IsString()
  @IsOptional()
  readonly referral_source: string;
}
