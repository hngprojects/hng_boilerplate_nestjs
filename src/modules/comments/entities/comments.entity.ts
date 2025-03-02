import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Comment extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  comment: string;

  @ManyToOne(() => Product, product => product.comments, { cascade: true })
  product: Product;

  @ManyToOne(() => User, user => user.comments, { cascade: true })
  user: User;

  @Column({ nullable: true })
  model_id: string;

  @Column({ nullable: true })
  model_type: string;


  // Threading fields for PostgreSQL
  @ManyToOne(() => Comment, comment => comment.replies, { nullable: true })
  parent: Comment;

  @OneToMany(() => Comment, comment => comment.parent)
  replies: Comment[];

  @Column({ type: 'int', default: 0 }) // Add dislikes column
  dislikes: number;

  @Column('simple-array', { nullable: true }) // Store user IDs as an array
  dislikedBy: string[];
