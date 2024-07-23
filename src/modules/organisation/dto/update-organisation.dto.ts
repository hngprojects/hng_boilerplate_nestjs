import { PartialType } from '@nestjs/swagger';
import { CreateOrganisationDto } from './create-organisation.dto';
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class UpdateOrganisationDto extends PartialType(CreateOrganisationDto) {
  @IsString()
  @MinLength(2, { message: 'Organization name must be at least 2 characters long' })
  @IsOptional()
  name?: string;

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
