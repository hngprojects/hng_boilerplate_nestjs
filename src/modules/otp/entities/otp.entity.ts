import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Otp extends AbstractBaseEntity {
  @Column()
  token: string;

  @Column()
  expiry: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;
}
