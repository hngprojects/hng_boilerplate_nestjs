import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OrganisationRequestDto {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @ApiProperty({
    type: String,
    description: 'Organisation email must be unique',
  })
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly industry: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly type: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  readonly address: string;

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  readonly state: string;
}
