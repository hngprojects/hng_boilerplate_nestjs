import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Faq extends AbstractBaseEntity {
  @Column({ nullable: false })
  question: string;

  @Column({ nullable: false })
  answer: string;

  @Column({ nullable: false })
  category: string;

  @Column({ nullable: false, type: 'simple-array' })
  tags: string[];

  @Column({ nullable: false, default: 'ADMIN' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
