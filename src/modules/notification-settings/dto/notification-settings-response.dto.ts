import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class NotificationSettingsResponseDto {
  status: string;
  message: string;
  status_code: string;
  data: {
    email_notification_activity_in_workspace: boolean;
    email_notification_always_send_email_notifications: boolean;
    email_notification_email_digest: boolean;
    email_notification_announcement_and_update_emails: boolean;
    slack_notifications_activity_on_your_workspace: boolean;
    slack_notifications_always_send_email_notifications: boolean;
    slack_notifications_announcement_and_update_emails: boolean;
  };
}
