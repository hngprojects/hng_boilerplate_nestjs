import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class OrganisationRequestDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly description: string;

  @ApiProperty({
    type: String,
    description: 'Organisation email must be unique',
  })
  @IsEmail()
  @IsOptional()
  readonly email: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly industry: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly type: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly country: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly address: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsOptional()
  readonly state: string;
}
