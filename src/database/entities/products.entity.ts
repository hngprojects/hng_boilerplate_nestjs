import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { Review } from './reviews.entity';
import { User } from './user.entity';
import { ProductCategory } from './product-categories.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('float', { nullable: false })
  price: number;

  @Column('int', { default: 0, nullable: false })
  currentStock: number;

  @Column('boolean', { default: false, nullable: false })
  inStock: boolean;

  @ManyToOne(() => ProductCategory, category => category.products, { nullable: true, onDelete: 'SET NULL' })
  category: ProductCategory;

  @OneToMany(() => Review, review => review.product)
  reviews: Review[];

  @ManyToOne(() => User, user => user.products)
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
