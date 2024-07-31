export class UnreadNotificationsResponseDto {
  status: string;

  message: string;

  status_code: number;

  data: {
    totalNotificationCount: number;
    totalUnreadNotificationCount: number;
    //notifications: {
    // id: string;
    //message: string;
    //is_read: boolean;
    //created_at: Date;
    //}[];
  };
}
