import { Waitlist } from '../entities/waitlist.entity';

export class GetWaitlistResponseDto {
  status: number;
  status_code: number;
  message: string;
  data: Waitlist[];
}
