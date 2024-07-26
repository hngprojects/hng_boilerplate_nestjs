import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Faqs extends AbstractBaseEntity {
  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false })
  answer: string;
}
