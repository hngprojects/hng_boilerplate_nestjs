import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from './../../../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class NotificationSettings extends AbstractBaseEntity {
  @ApiProperty()
  @Column({ unique: true, nullable: false })
  user_id: string;

  @ApiProperty()
  @Column({ nullable: true })
  email_notifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  push_notifications: boolean;

  @ApiProperty()
  @Column({ nullable: true })
  sms_notifications: boolean;
}
