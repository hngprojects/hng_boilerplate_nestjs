import { Organisation } from '../../organisations/entities/organisations.entity';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BillingPlan } from '../../billing-plans/entities/billing-plan.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Subscription extends AbstractBaseEntity {
  @Column('text', { nullable: false })
  billing_option: 'monthly' | 'yearly';

  @OneToOne(() => BillingPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: BillingPlan;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => Organisation)
  @JoinColumn({ name: 'organization_id' })
  organization: Organisation;

  @Column('text', { nullable: false })
  price: number;

  @Column('text', { nullable: false })
  status: string;

  @Column('text', { nullable: true })
  transaction_ref: string;

  @Column('text', { nullable: false })
  expiresAt: Date;
}
