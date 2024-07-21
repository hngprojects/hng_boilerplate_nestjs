import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  product_name: string;

  @Column({ nullable: false })
  product_category: string;

  @Column({ nullable: false })
  product_price: number;

  @Column()
  description?: string;
}
