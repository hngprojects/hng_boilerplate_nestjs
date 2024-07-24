import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
//This is How the user table should look like
//@Entity()
//export class User {
//  .........

// @OneToMany(() => Blog, (blog) => blog.author)
// blogs: Blog[];

//@OneToMany(() => Comment, (comment) =>
//comment.author)
// comments: Comment[];
//}

@Entity()
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @Column({ default: true })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Comment, comment => comment.blog)
  comments: Comment[];

  @ManyToOne(() => Category, category => category.blogs)
  category: Category;

  @ManyToOne(() => Topic, topic => topic.blogs)
  topic: Topic;
}
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Blog, blog => blog.category)
  blogs: Blog[];
}

@Entity()
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Blog, blog => blog.topic)
  blogs: Blog[];
}

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @ManyToOne(() => Blog, blog => blog.comments)
  blog: Blog;

  @ManyToOne(() => User, user => user.comments)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
