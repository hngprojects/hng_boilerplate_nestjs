import { ApiProperty } from '@nestjs/swagger';
import { WaitlistResponseData } from './waitlist-response-data';

export class GetWaitlistResponseDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  status_code: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: WaitlistResponseData })
  data: WaitlistResponseData;
}
