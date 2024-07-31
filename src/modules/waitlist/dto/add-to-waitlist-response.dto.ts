export class AddToWaitlistResponseDto {
  status: number;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}
