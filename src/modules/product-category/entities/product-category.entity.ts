import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class ProductCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  @Index()
  name: string;

  @Column('text')
  @Index()
  description: string;

  @Column('text')
  slug: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
