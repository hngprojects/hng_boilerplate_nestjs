import { Entity, PrimaryGeneratedColumn, Column, Index, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class ProductCategory extends AbstractBaseEntity {
  @Column({ length: 500, nullable: false })
  @Index()
  name: string;

  @Column('text', { nullable: false })
  @Index()
  description: string;

  @Column('text', { nullable: false })
  @Index()
  slug: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
