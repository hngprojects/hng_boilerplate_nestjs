import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Blog } from './blog.entity';

@Entity()
export class BlogPostCategory extends AbstractBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Blog, blog => blog.category_id)
  blogs: Blog[];
}
