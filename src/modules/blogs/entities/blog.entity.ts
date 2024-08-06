import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
@Entity()
export class Blog extends AbstractBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  blog_id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('simple-array', { nullable: true })
  image_urls?: string[];

  @ManyToOne(() => User, user => user.blogs)
  author: User;
}
