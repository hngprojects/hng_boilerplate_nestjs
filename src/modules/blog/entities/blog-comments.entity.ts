import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { BlogPost } from './blog.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class BlogPostComment extends AbstractBaseEntity {
  @ManyToOne(() => BlogPost, blog => blog.comments)
  blog: BlogPost;

  @ManyToOne(() => User, user => user.comments)
  author: User;
}
