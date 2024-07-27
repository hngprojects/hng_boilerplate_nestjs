import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Blog } from './blog.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class BlogPostComment extends AbstractBaseEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => Blog, blog => blog.comments)
  blog: Blog;

  @ManyToOne(() => User, user => user.comments)
  author: User;
}
