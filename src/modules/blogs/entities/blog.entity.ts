import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Blog extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('simple-array', { nullable: true })
  image_urls?: string[];

  @ManyToOne(() => User, user => user.blogs)
  author: User;
}
