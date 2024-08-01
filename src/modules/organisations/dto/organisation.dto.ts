import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class OrganisationRequestDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly name: string;

  @ApiProperty({
    type: String,
    description: 'Organisation email must be unique',
  })
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly industry: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly country: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly address: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  readonly state: string;
}
