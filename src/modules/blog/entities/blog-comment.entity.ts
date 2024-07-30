import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Blog } from './blog.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class BlogPostComment extends AbstractBaseEntity {
  @Column('text')
  content: string;

  @ManyToOne(() => Blog, blog => blog.comments)
  blog: Blog;

  @ManyToOne(() => Blog, blog => blog.comments)
  author: Blog;
}
