import { notificationPropDto } from './notification-prop.dto';

export class getNotificationsResponseDto {
  status: string;
  message: string;
  status_code: number;
  data: any;
  notifications: notificationPropDto[];
}
