import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Blog } from './blog.entity';

@Entity()
export class BlogCategory extends AbstractBaseEntity {
  @Column()
  name: string;

  @OneToMany(() => Blog, blog => blog.category)
  blogs: Blog[];
}
