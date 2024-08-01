import { IsString, IsUUID, IsBoolean, IsEmail, IsObject } from 'class-validator';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { ApiProperty } from '@nestjs/swagger';

export class InviteDto {
  @ApiProperty({
    description: 'id',
    type: 'string',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'token',
    type: 'string',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'organisation',
    type: 'object',
  })
  @IsObject()
  organisation: Organisation;

  @ApiProperty({
    description: 'email',
    type: 'string',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'isGeneric',
    type: 'boolean',
  })
  @IsBoolean()
  isGeneric: boolean;

  @ApiProperty({
    description: 'isAccepted',
    type: 'boolean',
  })
  @IsBoolean()
  isAccepted: boolean;
}
