import { ApiProperty } from '@nestjs/swagger';
import { WaitlistItem } from './waitlist-item.dto';

export class WaitlistResponseData {
  @ApiProperty({
    type: WaitlistItem,
    isArray: true,
    example: [
      {
        id: 'string',
        name: 'string',
        email: 'string',
        status: true,
        url_slug: 'string',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  })
  waitlist: WaitlistItem[];
}
