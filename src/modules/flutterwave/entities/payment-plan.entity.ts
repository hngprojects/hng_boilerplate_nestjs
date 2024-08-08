import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class PaymentPlan extends AbstractBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  amount: number;

  @Column({ nullable: false })
  duration: number;

  @Column({ nullable: false })
  interval: string;

  @Column({ nullable: true })
  features: string;
}
