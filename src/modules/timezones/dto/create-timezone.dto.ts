import { ApiProperty } from '@nestjs/swagger';

export class CreateTimezoneDto {
  @ApiProperty({ example: '1', description: 'The ID of the timezone' })
  id: string;

  @ApiProperty({ example: 'UTC', description: 'The name of the timezone' })
  timezone: string;
}
