import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

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
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly interests?: string[];

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly referral_source?: string;
}
