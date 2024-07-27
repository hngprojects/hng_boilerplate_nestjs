import { Entity, Column, Index, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity('categories')
export class ProductCategory extends AbstractBaseEntity {
  @Column({ length: 500, nullable: false })
  @Index()
  name: string;

  @Column('text', { nullable: false })
  @Index()
  description: string;

  @Column('text', { nullable: false })
  slug: string;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}
