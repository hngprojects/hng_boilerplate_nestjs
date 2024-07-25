import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class NotificationSettings {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ApiProperty()
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updated_at: Date;
}
