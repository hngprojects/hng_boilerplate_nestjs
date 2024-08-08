import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Comment } from '../../../modules/comments/entities/comments.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { Cart } from '../../revenue/entities/cart.entity';
import { OrderItem } from '../../revenue/entities/order-items.entity';

export enum StockStatusType {
  IN_STOCK = 'in stock',
  OUT_STOCK = 'out of stock',
  LOW_STOCK = 'low on stock',
}

export enum ProductSizeType {
  SMALL = 'Small',
  STANDARD = 'Standard',
  LARGE = 'Large',
}

@Entity()
export class Product extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  image: string;

  @Column({ type: 'float', nullable: false, default: 0 })
  price: number;

  @Column({ type: 'float', nullable: false, default: 0 })
  cost_price: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  quantity: number;

  @Column({ nullable: true, default: false })
  is_deleted: boolean;

  @Column({
    type: 'enum',
    enum: ProductSizeType,
    default: ProductSizeType.STANDARD,
  })
  size: ProductSizeType;

  @Column({
    type: 'enum',
    enum: StockStatusType,
    default: StockStatusType.OUT_STOCK,
  })
  stock_status: StockStatusType;

  @ManyToOne(() => Organisation, org => org.products)
  org: Organisation;

  @OneToMany(() => Comment, comment => comment.product)
  comments?: Comment[];

  @OneToMany(() => OrderItem, orderItem => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => Cart, cart => cart.product)
  cart: Cart[];
}
