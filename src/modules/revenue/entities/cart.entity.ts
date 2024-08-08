import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../user/entities/user.entity';
@Entity()
export class Cart extends AbstractBaseEntity {
  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number;

  @ManyToOne(() => Product, product => product.cart)
  product: Product;

  @ManyToOne(() => User, user => user.cart)
  user: User;
}
