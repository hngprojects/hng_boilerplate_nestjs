import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class BillingPlan extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: false })
  frequency: string;

  @Column({ default: 'true' })
  is_active: boolean;

  @Column({ type: 'int', nullable: true })
  amount: number;
}
