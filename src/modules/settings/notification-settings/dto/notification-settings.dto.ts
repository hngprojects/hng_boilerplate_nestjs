import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class NotificationSettingsDto {
  // @ApiProperty()
  // @IsNotEmpty()
  // @IsEmail()
  // user_id: string;

  @ApiProperty()
  @IsBoolean()
  email_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  push_notifications: boolean;

  @ApiProperty()
  @IsBoolean()
  sms_notifications: boolean;
}
