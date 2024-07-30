export class CreateNotificationResponseDto {
  status: string;
  message: string;
  status_code: number;
  data: Data;
}

interface Data {
  notifications: ResponseNotification[];
}

interface ResponseNotification {
  notification_id: string;
  user_id: string;
  message: string;
  is_read: boolean;
  created_at: string | Date;
}
