import { ApiProperty } from '@nestjs/swagger';
export class UnreadNotificationsResponseDto {
  @ApiProperty()
  status: string;
  @ApiProperty()
  status_code: number;
  @ApiProperty()
  message: string;
  @ApiProperty({
    type: 'object',
    properties: {
      notifications: {
        type: 'array',
        items: { type: 'string' },
        example: [
          {
            id: 'string',
            message: 'string',
            is_read: 'boolean',
            created_at: Date.now(),
          },
        ],
      },
    },
  })
  data: object;
}
