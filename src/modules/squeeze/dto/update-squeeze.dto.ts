import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSqueezeDto {
  @ApiProperty({
    description: 'The email address of the squeeze record to update',
    example: 'janedoe@example.com',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({ required: false, example: 'Jane' })
  @IsString()
  @IsOptional()
  readonly first_name?: string;

  @ApiProperty({ required: false, example: 'Doe' })
  @IsString()
  @IsOptional()
  readonly last_name?: string;

  @ApiProperty({ required: false, example: '+2347023456789' })
  @IsString()
  @IsOptional()
  readonly phone?: string;

  @ApiProperty({ required: false, example: 'Lagos, Nigeria' })
  @IsString()
  @IsOptional()
  readonly location?: string;

  @ApiProperty({ required: false, example: 'Backend Developer' })
  @IsString()
  @IsOptional()
  readonly job_title?: string;

  @ApiProperty({ required: false, example: 'Microsoft' })
  @IsString()
  @IsOptional()
  readonly company?: string;

  @ApiProperty({ required: false, example: ['Backend Development', 'Game Development'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsOptional()
  readonly interests?: string[];

  @ApiProperty({ required: false, example: 'LinkedIn' })
  @IsString()
  @IsOptional()
  readonly referral_source?: string;
}
