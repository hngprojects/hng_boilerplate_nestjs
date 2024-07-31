import { AbstractBaseEntity } from './../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Payment_History extends AbstractBaseEntity {
  @Column('text', { nullable: false })
  user: string;

  @Column('text', { nullable: false })
  subscription_id: string;

  @Column('text', { nullable: true })
  transactionRef: string;

  @Column('text', { nullable: false })
  expiresAt: Date;
}
