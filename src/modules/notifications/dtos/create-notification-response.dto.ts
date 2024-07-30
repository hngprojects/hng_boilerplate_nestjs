import { IsString } from 'class-validator';

class Data {
  notifications: ResponseNotification[];
}

export class CreateNotificationResponseDto {
  @IsString()
  status: string;
  @IsString()
  message: string;
  @IsString()
  status_code: number;
  @IsString()
  data: Data;
}

class ResponseNotification {
  notification_id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string | Date;
}
