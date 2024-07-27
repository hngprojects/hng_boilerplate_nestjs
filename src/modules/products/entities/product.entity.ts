import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  product_name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('int', { nullable: false })
  quantity: number;

  @Column('int', { nullable: false })
  price: number;

  @ManyToOne(() => User, user => user.products)
  user: User;

  @ManyToOne(() => ProductCategory, category => category.products)
  category: ProductCategory;
}
