import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Session extends AbstractBaseEntity {
  @Column({ type: 'varchar', nullable: true })
  device_browser?: string;

  @Column({ type: 'varchar', nullable: true })
  device_browser_version?: string;

  @Column({ type: 'varchar', nullable: true })
  device_os?: string;

  @Column({ type: 'varchar', nullable: true })
  device_os_version?: string;

  @Column({ type: 'varchar', nullable: true })
  device_type?: string;

  @Column({ type: 'varchar', nullable: true })
  device_brand?: string;

  @Column({ type: 'varchar', nullable: true })
  device_model?: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @ManyToOne(() => User, user => user.sessions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
