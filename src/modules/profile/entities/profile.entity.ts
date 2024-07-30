import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Profile extends AbstractBaseEntity {
  @Column()
  username: string;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  pronouns: string;

  @Column({ nullable: true })
  dept: string;

  @Column()
  email: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  socialLinks: string;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  timezones: string;

  @Column({ nullable: true })
  profilePicUrl: string;

  @OneToOne(() => User, user => user.profile)
  @JoinColumn({ name: 'user_id' })
  user_id: User;
}
