import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { OrderItem } from './order-items.entity';
import { Transaction } from './transaction.entity';

@Entity()
export class Order extends AbstractBaseEntity {
  @Column({ type: 'float', nullable: false, default: 0 })
  total_price: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => Transaction, transaction => transaction.order)
  transactions: Transaction[];
}
