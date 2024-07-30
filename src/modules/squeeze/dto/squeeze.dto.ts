import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

export class SqueezeRequestDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly first_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly last_name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly phone?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly location?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly job_title?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly company?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  readonly interests?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly referral_source?: string;
}
