import { ApiProperty } from '@nestjs/swagger';

export class WaitlistItem {
  @ApiProperty({ type: 'string', example: 'string' })
  id: string;

  @ApiProperty({ type: 'string', example: 'string' })
  name: string;

  @ApiProperty({ type: 'string', example: 'string' })
  email: string;

  @ApiProperty({ type: 'boolean', example: true })
  status: boolean;

  @ApiProperty({ type: 'string', required: false, example: 'string' })
  url_slug?: string;

  @ApiProperty({ type: 'string', format: 'date-time', example: new Date().toISOString() })
  createdAt: string;

  @ApiProperty({ type: 'string', format: 'date-time', example: new Date().toISOString() })
  updatedAt: string;
}
