import { AbstractBaseEntity } from 'src/entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum PaymentStatus {
  'PENDING' = 'pending',
  'APPROVED' = 'approved',
  'FAILED' = 'failed',
}

@Entity()
export class Payment extends AbstractBaseEntity {
  @Column()
  user_id: string;

  @Column()
  transaction_id: string;

  @Column()
  gateway_id: string;

  @Column()
  amount: number;

  @Column()
  status: PaymentStatus;
}
