import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { BlogComment } from './blog-comments.entity';
import { BlogCategory } from './blog-category.entity';

@Entity()
export class Blog extends AbstractBaseEntity {
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

  @OneToMany(() => BlogComment, comment => comment.blog)
  comments: BlogComment[];

  @ManyToOne(() => BlogCategory, category => category.blogs)
  category: BlogCategory;
}
