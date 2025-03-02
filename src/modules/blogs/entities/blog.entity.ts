import { Entity, Column, ManyToOne, DeleteDateColumn, BeforeUpdate } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Blog extends AbstractBaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column('text', { nullable: false })
  content: string;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Column('simple-array', { nullable: true })
  image_urls?: string[];

  @DeleteDateColumn({ nullable: true, default: null })
  deletedAt?: Date;

  @Column({ nullable: true, default: null })
  published_date?: Date;

  @ManyToOne(() => User, user => user.blogs)
  author: User;
}
