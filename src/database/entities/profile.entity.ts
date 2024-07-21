import { Column, Entity, PrimaryGeneratedColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: false })
  phone: string;

  @Column()
  avatar_image: string;

  @OneToOne(() => User, user => user.profile)
  user: User;
}
