import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsString, ValidateNested } from 'class-validator';

export class SqueezeRequestDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  readonly first_name: string;

  @ApiProperty()
  @IsString()
  readonly last_name: string;

  @ApiProperty()
  @IsString()
  readonly phone: string;

  @ApiProperty()
  @IsString()
  readonly location: string;

  @ApiProperty()
  @IsString()
  readonly job_title: string;

  @ApiProperty()
  @IsString()
  readonly company: string;

  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly interests: string[];

  @ApiProperty()
  @IsString()
  readonly referral_source: string;
}
