import { ParseIntPipe } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class BackupCodesReqBodyDTO {
  @ApiProperty()
  @IsNotEmpty()
  totp_code: number;

  @ApiProperty()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}
