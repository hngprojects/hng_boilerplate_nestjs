import { Column, Entity, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ nullable: false })
  phone: string;

  @Column()
  avatar_image: string;

  @OneToOne(() => User, user => user.profile)
  user: User;
}
