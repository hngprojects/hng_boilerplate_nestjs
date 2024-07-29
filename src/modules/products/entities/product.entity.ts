import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { ProductCategory } from '../../product-category/entities/product-category.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product extends AbstractBaseEntity {

  @Column({ type: 'text' })
  name: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  @Column('int')
  avail_qty: number;
  
  @ManyToOne(() => User, user => user.products)
  user: User;
  
  @ManyToOne(() => ProductCategory, category => category.products)
  category: ProductCategory;
}

