export class LoginResponseDto {
  message: string;
  data: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: Date;
    updated_at: Date;
  };
  access_token: string;
  refresh_token: string;
}
