import { SubscriptionPlan } from 'src/database/entities/subscription_plan.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Feature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  feature: string;

  @ManyToOne(() => SubscriptionPlan, plans => plans.feature)
  plans: SubscriptionPlan;
}
