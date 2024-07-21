import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Product } from './products.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.reviews, { nullable: false })
  user: User;

  @Column({ type: 'float', default: 0, nullable: false })
  rating: number;

  @Column('text', { nullable: false })
  comment: string;

  @ManyToOne(() => Product, product => product.reviews, { nullable: false, onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
