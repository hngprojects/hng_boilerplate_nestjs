import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Notification extends AbstractBaseEntity {
  @Column({ nullable: false })
  message: string;

  @Column({ nullable: false, default: false })
  is_Read: boolean;

  @ManyToOne(() => User, user => user.notifications)
  user: User;
}
