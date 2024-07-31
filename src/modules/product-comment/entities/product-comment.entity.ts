import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from '../../../modules/products/entities/product.entity';
import { User } from '../../../modules/user/entities/user.entity';
import { Entity, Column, ManyToOne } from 'typeorm';

@Entity()
export class ProductComment extends AbstractBaseEntity {
  @ManyToOne(() => Product, product => product.comments, { onDelete: 'CASCADE' })
  product: Product;

  @ManyToOne(() => User, user => user.productComments, { onDelete: 'CASCADE' })
  user: User;

  @Column('text')
  comment: string;
}
