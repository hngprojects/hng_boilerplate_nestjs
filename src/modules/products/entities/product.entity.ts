import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text' })
  product_name: string;

  @Column('text')
  description: string;

  @Column('int')
  quantity: number;

  @Column('int')
  price: number;

  @ManyToOne(() => User, user => user.products)
  user: User;
  
  @ManyToOne(() => ProductCategory, category => category.product)
  category: ProductCategory;
}