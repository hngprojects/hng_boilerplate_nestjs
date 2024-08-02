import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class AcceptInviteDto {
  @ApiProperty({
    description: 'token',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'email',
    type: 'string',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
