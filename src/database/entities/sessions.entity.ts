// sessions.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Sessions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'device_type' })
  deviceType: string;

  @Column({ name: 'token', nullable: false })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @ManyToOne(() => User, user => user.sessions, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
