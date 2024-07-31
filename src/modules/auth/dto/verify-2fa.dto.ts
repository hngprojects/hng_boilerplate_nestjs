import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Verify2FADto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  totp_code: string;
}
