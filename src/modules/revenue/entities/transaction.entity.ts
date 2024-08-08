import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Order } from './order.entity';

@Entity()
export class Transaction extends AbstractBaseEntity {
  @Column({ type: 'float', nullable: false, default: 0 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  date: Date;

  @ManyToOne(() => Order, order => order.transactions)
  order: Order;
}
