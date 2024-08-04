import { AbstractBaseEntity } from 'src/entities/base.entity';
import { Column, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Room } from './room.entity';
import { User } from './user.entity';

export default class Message extends AbstractBaseEntity {
  @ManyToOne(() => Room, room => room.id)
  @JoinColumn({ name: 'message_id', referencedColumnName: 'id' })
  room: Room;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'text' })
  content: string;
}
