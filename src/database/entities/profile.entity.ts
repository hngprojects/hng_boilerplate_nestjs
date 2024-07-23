import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column('text')
  bio: string;

  @Column()
  avatarImage: string;

  @Column()
  phone: string;

  @ManyToOne(() => User, user => user.profile)
  user: User;
}
