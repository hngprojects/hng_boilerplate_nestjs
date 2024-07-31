import { AbstractBaseEntity } from 'src/entities/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity()
export class Payment extends AbstractBaseEntity {
  @Column()
  user_id: User;

  @Column()
  transaction_id: string;

  @Column()
  gateway_id: string;

  @Column()
  amount: number;

  @Column()
  status: PaymentStatus;
}
