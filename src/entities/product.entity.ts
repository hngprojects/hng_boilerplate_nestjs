import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  product_name: string;

  @Column({ nullable: false })
  product_price: number;

  @Column({ nullable: false })
  description: string;

  @ManyToOne(type => User, user => user.products)
  user: User;
}
