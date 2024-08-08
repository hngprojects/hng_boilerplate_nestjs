import { PartialType } from '@nestjs/mapped-types';
import { OrganisationRequestDto } from './organisation.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from '../../../modules/user/entities/user.entity';

export class UpdateOrganisationDto extends PartialType(OrganisationRequestDto) {
  @ApiPropertyOptional({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Organisation email must be unique',
  })
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly industry?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly type?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly country?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly address?: string;

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  owner?: User;

  @IsString()
  @IsOptional()
  state?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
