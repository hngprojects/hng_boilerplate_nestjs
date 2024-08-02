import { Organisation } from '../../organisations/entities/organisations.entity';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BillingPlan } from '../../billing-plans/entities/billing-plan.entity';

@Entity()
export class Subscription extends AbstractBaseEntity {
  @Column('text', { nullable: false })
  billing_option: 'monthly' | 'yearly';

  @OneToOne(() => BillingPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: BillingPlan;

  @OneToOne(() => Organisation)
  @JoinColumn({ name: 'organization_id' })
  organization: Organisation;

  @Column('text', { nullable: false })
  price: number;

  @Column('text', { nullable: false })
  status: string;

  @Column('text', { nullable: true })
  transactionRef: string;

  @Column('text', { nullable: false })
  expiresAt: Date;
}
