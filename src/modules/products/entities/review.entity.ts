import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text' })
  review: string;

  @Column()
  createdBy: string; // This will be user ID

  @ManyToOne(() => Product, product => product.reviews, { onDelete: 'CASCADE' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
