import { AbstractBaseEntity } from '../../../entities/base.entity';

import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class BillingPlan extends AbstractBaseEntity {
  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'int', nullable: false, default: 0 })
  price: number;
}
