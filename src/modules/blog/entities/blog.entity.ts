import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { BlogPostComment } from './blog-comments.entity';
import { createBlogPostCategory } from './blog-category.entity';

@Entity()
export class BlogPost extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column()
  image_url: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.blogs)
  author: User;

  @Column({ default: true })
  isPublished: boolean;

  @OneToMany(() => BlogPostComment, comment => comment.blog)
  comments: BlogPostComment[];

  @ManyToOne(() => createBlogPostCategory, category => category.blogs)
  category: createBlogPostCategory;
}
