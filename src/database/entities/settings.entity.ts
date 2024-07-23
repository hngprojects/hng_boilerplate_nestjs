import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NotificationSettings } from './notification-settings.entity';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => NotificationSettings, notificationSettings => notificationSettings.settings, { eager: true })
  @JoinColumn({ name: 'notification_id' })
  notification: NotificationSettings;

  @UpdateDateColumn()
  updatedAt: Date;
}
