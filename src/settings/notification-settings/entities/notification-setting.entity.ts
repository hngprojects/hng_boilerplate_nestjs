import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('notification_settings')
@Unique(['userId'])
export class NotificationSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'email_notifications', default: true })
  emailNotifications: boolean;

  @Column({ name: 'push_notifications', default: true })
  pushNotifications: boolean;

  @Column({ name: 'sms_notifications', default: true })
  smsNotifications: boolean;
}
