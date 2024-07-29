import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class NotificationSettingsDto {
  @ApiProperty()
  @IsBoolean()
  mobile_push_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  email_notification_activity_in_workspace: boolean;

  @ApiProperty()
  @IsBoolean()
  email_notification_always_send_email_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  email_notification_email_digest: boolean;

  @ApiProperty()
  @IsBoolean()
  email_notification_announcement_and_update_emails: boolean;

  @ApiProperty()
  @IsBoolean()
  slack_notifications_activity_on_your_workspace: boolean;

  @ApiProperty()
  @IsBoolean()
  slack_notifications_always_send_email_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  slack_notifications_announcement_and_update_emails: boolean;
}
