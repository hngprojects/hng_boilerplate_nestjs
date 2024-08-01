import { WaitlistPage } from '../entities/waitlist-page.entity';

export class GetWaitlistPageResponseDTO {
  status: number;
  status_code: number;
  message: string;
  data: {
    waitlist: WaitlistPage[];
  };
}
