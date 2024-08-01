import { WaitlistPage } from '../entities/waitlist-page.entity';

export class CreateWaitlistPageResponseDTO {
  status: string;
  status_code: number;
  message: string;
  data: {
    waitlist: WaitlistPage;
  };
}
