import { notificationPropDto } from './notification-prop.dto';

export class getResponseDto {
  status: string;
  message: string;
  status_code: number;
  data: any;
  notifications: notificationPropDto[];
}
