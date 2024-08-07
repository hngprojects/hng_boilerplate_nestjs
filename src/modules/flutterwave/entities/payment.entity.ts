import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

export enum PaymentStatus {
  'PENDING' = 'pending',
  'APPROVED' = 'approved',
  'FAILED' = 'failed',
}

@Entity()
export class Payment extends AbstractBaseEntity {
  @Column({ nullable: false })
  user_id: string;

  @Column({ nullable: false })
  transaction_id: string;

  @Column({ nullable: true })
  gateway_id: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: true })
  status: PaymentStatus;
}
