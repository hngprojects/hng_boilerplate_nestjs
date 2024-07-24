import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEmail, IsString, ValidateNested } from 'class-validator';

export class SqueezeRequestDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly first_name: string;

  @IsString()
  readonly last_name: string;

  @IsString()
  readonly phone: string;

  @IsString()
  readonly location: string;

  @IsString()
  readonly job_title: string;

  @IsString()
  readonly company: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly interests: string[];

  @IsString()
  readonly referral_source: string;
}
