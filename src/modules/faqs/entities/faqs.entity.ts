import { Column, Entity } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Faqs extends AbstractBaseEntity {
  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false })
  answer: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  tags: string;
}
