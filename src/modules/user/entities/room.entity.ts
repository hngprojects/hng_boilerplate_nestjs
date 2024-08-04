import { AbstractBaseEntity } from 'src/entities/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'rooms' })
export class Room extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  version: number;

  @Column()
  last_messages: string;

  @Column()
  bumpedAt: number;

  @ManyToMany(() => User, user => user.rooms)
  members: User[];
}
