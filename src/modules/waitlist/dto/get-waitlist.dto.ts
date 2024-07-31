export class GetWaitlistResponseDto {
  status: number;
  status_code: number;
  message: string;
  data: GetWaitlistDataInterface;
}

interface GetWaitlistDataInterface {
  waitlist: {
    id: string;
    name: string;
    email: string;
    status: boolean;
    url_slug?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
