import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity()
export class Blog extends AbstractBaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column('text', { nullable: false })
  content: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('simple-array', { nullable: true })
  image_urls?: string[];

  @ManyToOne(() => Comment, comment => comment.blog)
  comments: Comment[];

  @ManyToOne(() => User, user => user.blogs)
  author: User;
}
