import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { BlogPostComment } from './blog-comment.entity';
import { BlogPostCategory } from './blog-category.entity';
@Entity()
export class Blog extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column()
  image_url: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.id)
  author: User;

  @Column({ default: true })
  isPublished: boolean;

  @OneToMany(() => BlogPostComment, comment => comment.blog)
  comments: BlogPostComment[];

  @ManyToOne(() => BlogPostCategory, category => category.blogs)
  category_id: BlogPostCategory;
}
