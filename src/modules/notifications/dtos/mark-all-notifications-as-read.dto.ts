import { ApiProperty } from '@nestjs/swagger';

export class MarkAllNotificationAsReadResponse {
  status: string;
  status_code: number;
  message: string;
  @ApiProperty({
    type: 'object',
    properties: { notifications: { type: 'array', items: { type: 'string' }, example: [] } },
  })
  data: Record<string, never>;
}
