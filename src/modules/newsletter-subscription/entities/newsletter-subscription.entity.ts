import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

@Entity('newsletters')
export class NewsletterSubscription extends AbstractBaseEntity {
  @Column({ unique: true })
  email: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
