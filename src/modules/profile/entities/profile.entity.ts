import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
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
  department: string;

  @Column()
  email: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  social_links: string[];

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  timezones: string;

  @Column({ nullable: true })
  profile_pic_url: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}
