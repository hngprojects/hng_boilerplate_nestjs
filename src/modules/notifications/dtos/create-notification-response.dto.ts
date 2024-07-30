import { NotificationData } from './notification-data.dto';

export class CreateNotificationResponseDto {
  status: string;
  message: string;
  status_code: number;
  data: NotificationData;
}
