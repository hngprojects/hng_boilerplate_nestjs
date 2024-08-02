import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  mobile_push_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  email_notification_activity_in_workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  email_notification_always_send_email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  email_notification_email_digest?: boolean;

  @IsOptional()
  @IsBoolean()
  email_notification_announcement_and_update_emails?: boolean;

  @IsOptional()
  @IsBoolean()
  slack_notifications_activity_on_your_workspace?: boolean;

  @IsOptional()
  @IsBoolean()
  slack_notifications_always_send_email_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  slack_notifications_announcement_and_update_emails?: boolean;
}
