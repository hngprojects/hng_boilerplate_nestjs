import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class Enable2FADto {
  @ApiProperty()
  @IsString()
  password: string;
}
