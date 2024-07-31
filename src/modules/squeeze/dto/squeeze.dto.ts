import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class SqueezeRequestDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly first_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly last_name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly phone?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly location?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly job_title?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly company?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly interests?: string[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly referral_source?: string;
}
