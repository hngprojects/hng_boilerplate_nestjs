export class MarkAllNotificationAsReadError {
  status: boolean;
  status_code: number;
  error: string;
  message: string;
}

class Data {
  notifications: [];
}

export class MarkAllNotificationAsReadResponse {
  status: string;
  status_code: number;
  message: string;
  data: Data;
}
