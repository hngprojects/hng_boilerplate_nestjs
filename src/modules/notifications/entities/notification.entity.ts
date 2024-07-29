import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Notification extends AbstractBaseEntity {
  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false, default: false, type: 'boolean' })
  is_Read: boolean;

  @ManyToOne(() => User, user => user.notifications, { nullable: false })
  user: User;
}
