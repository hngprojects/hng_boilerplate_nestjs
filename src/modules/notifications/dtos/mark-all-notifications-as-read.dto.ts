import { Notification } from '../entities/notifications.entity';

export class MarkAllNotificationAsReadResponse {
  status: string;
  status_code: number;
  message: string;
  data: {
    notifications: Notification[];
  };
}
