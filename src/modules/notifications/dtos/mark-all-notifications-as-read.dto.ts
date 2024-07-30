export class MarkAllNotificationAsReadResponse {
  status: string;
  status_code: number;
  message: string;
  data: {
    notifications: [];
  };
}
