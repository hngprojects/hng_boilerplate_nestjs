import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Squeeze extends AbstractBaseEntity {
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  job_title?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  referral_source?: string;

  @Column('simple-array', { nullable: true })
  interests?: string[];
}
