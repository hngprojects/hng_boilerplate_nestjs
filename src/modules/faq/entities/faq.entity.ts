import { Entity, Column } from 'typeorm';
import { IFaq } from '../faq.interface';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Faq extends AbstractBaseEntity implements IFaq {
  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false })
  answer: string;

  @Column({ nullable: false })
  category: string;

  @Column({ nullable: false, default: 'ADMIN' })
  createdBy: string;
}
