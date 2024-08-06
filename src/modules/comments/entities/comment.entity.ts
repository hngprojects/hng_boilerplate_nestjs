import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';
import { User } from '../../user/entities/user.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Comment extends AbstractBaseEntity {
  @ManyToOne(() => Blog, blog => blog.comments)
  blog: Blog;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @Column()
  content: string;
}
