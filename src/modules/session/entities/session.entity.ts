import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Session extends AbstractBaseEntity {
  @Column({ type: 'varchar' })
  device_browser: string;

  @Column({ type: 'varchar' })
  device_browser_version: string;

  @Column({ type: 'varchar' })
  device_os: string;

  @Column({ type: 'varchar' })
  device_os_version: string;

  @Column({ type: 'varchar' })
  device_type: string;

  @Column({ type: 'varchar' })
  device_brand: string;

  @Column({ type: 'varchar' })
  device_model: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @ManyToOne(() => User, user => user.sessions)
  user: User;

  @Column({ name: 'user_id' })
  userId: string;
}
