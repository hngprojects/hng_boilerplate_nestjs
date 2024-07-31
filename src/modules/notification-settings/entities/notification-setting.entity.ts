import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class NotificationSettings extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ unique: true, nullable: false })
  user_id: string;

  @ApiProperty()
  @Column({ default: false })
  mobile_push_notifications: boolean;

  @ApiProperty()
  @Column({ default: true })
  email_notification_activity_in_workspace: boolean;

  @ApiProperty()
  @Column({ default: true })
  email_notification_always_send_email_notifications: boolean;

  @ApiProperty()
  @Column({ default: false })
  email_notification_email_digest: boolean;

  @ApiProperty()
  @Column({ default: false })
  email_notification_announcement_and_update_emails: boolean;

  @ApiProperty()
  @Column({ default: false })
  slack_notifications_activity_on_your_workspace: boolean;

  @ApiProperty()
  @Column({ default: false })
  slack_notifications_always_send_email_notifications: boolean;

  @ApiProperty()
  @Column({ default: false })
  slack_notifications_announcement_and_update_emails: boolean;

  @ApiProperty()
  @OneToOne(() => User, user => user.notification_settings)
  user: User;
}
