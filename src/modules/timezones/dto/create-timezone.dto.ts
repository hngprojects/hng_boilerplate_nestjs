import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimezoneDto {
  @ApiProperty({
    description: 'The name of the timezone',
    example: 'America/New_York',
  })
  @IsString()
  timezone: string;

  @ApiProperty({
    description: 'The GMT offset of the timezone',
    example: '-05:00',
  })
  @IsString()
  gmtOffset: string;

  @ApiProperty({
    description: 'A description of the timezone',
    example: 'Eastern Standard Time',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
