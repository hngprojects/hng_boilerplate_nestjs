import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from './../../../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class NotificationSettings extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ unique: true })
  user_id: string;

  @ApiProperty()
  @Column()
  email_notifications: boolean;

  @ApiProperty()
  @Column()
  push_notifications: boolean;

  @ApiProperty()
  @Column()
  sms_notifications: boolean;
}
