import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Blog } from '../../blog/entities/blog.entity';

@Entity()
export class BlogPostCategory {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Blog, blog => blog.category_id)
  blog: Blog[];
}
