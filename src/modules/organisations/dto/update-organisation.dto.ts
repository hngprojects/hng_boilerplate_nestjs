import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class UpdateOrganisationDto {
  @ApiProperty({
    example: "CodeGhinux's Organisation",
    description: 'Name of organisation',
  })
  @IsString()
  @MinLength(2, { message: 'Organization name must be at least 2 characters long' })
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: "CodeGhinux's Organisation Description",
    description: 'description of organisation',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  owner?: User;

  @IsString()
  @IsOptional()
  state?: string;

  @IsOptional()
  creator?: User;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
