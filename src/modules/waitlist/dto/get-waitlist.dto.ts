export class GetWaitlistResponseDto {
  status: number;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      status: boolean;
      url_slug?: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}
