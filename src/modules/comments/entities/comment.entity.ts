import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Comment extends AbstractBaseEntity {
  @Column({ nullable: false })
  model_id: string;

  @Column()
  model_type: string;

  @Column()
  content: string;

  @ManyToOne(() => User, user => user.comments)
  user: User;
}
