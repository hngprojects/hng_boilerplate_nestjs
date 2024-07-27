import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { BlogPost } from './blog.entity';

@Entity()
export class createBlogPostCategory extends AbstractBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => BlogPost, blog => blog.category)
  blogs: BlogPost[];
}
