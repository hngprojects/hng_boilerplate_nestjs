import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTimezoneDto {
  @ApiProperty({ example: '1', description: 'The ID of the timezone' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'UTC', description: 'The name of the timezone' })
  @IsString()
  @IsNotEmpty()
  timezone: string;
}
