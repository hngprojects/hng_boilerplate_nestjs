import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Settings } from './settings.entity';

@Entity()
export class NotificationSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.notificationSettings)
  user: User;

  @Column()
  emailNotifications: boolean;

  @Column()
  pushNotifications: boolean;

  @Column()
  smsNotifications: boolean;

  @OneToMany(() => Settings, settings => settings.notification)
  settings: Settings[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
