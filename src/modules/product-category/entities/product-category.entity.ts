import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class ProductCategory extends AbstractBaseEntity {
  @Column({ length: 500 })
  @Index()
  name: string;

  @Column('text')
  @Index()
  description: string;

  @Column('text')
  slug: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
