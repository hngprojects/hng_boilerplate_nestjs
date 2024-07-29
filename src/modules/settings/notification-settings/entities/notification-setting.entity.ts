import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from '../../../../modules/user/entities/user.entity';
import { AbstractBaseEntity } from './../../../../entities/base.entity';

@Entity()
export class NotificationSettings extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ unique: true, nullable: false })
  user_id: string;

  @ApiProperty()
  @Column({ nullable: true })
  mobile_push_notifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  email_notification_activity_in_workspace: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  email_notification_always_send_email_notifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  email_notification_email_digest: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  email_notification_announcement_and_update_emails: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  slack_notifications_activity_on_your_workspace: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  slack_notifications_always_send_email_notifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  slack_notifications_announcement_and_update_emails: boolean;

  @ApiProperty()
  @OneToOne(() => User, User => User.notification_settings)
  user: User;
}
