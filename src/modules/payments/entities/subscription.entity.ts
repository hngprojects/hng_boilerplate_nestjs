import { AbstractBaseEntity } from './../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Subscription extends AbstractBaseEntity {
  @Column('text', { nullable: false })
  billing_option: 'monthly' | 'yearly';

  @Column('text', { nullable: false })
  plan_id: string;

  @Column('text', { nullable: false })
  price: number;

  @Column('text', { nullable: false })
  status: string;

  @Column('text', { nullable: true })
  transactionRef: string;

  @Column('text', { nullable: false })
  expiresAt: Date;
}
