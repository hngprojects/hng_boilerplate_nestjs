import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Squeeze extends AbstractBaseEntity {
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  phone: string;

  @Column({ nullable: false })
  location: string;

  @Column({ nullable: false })
  job_title: string;

  @Column({ nullable: false })
  company: string;

  @Column({ nullable: false })
  referral_source: string;

  @Column('simple-array', { nullable: false })
  interests: string[];
}
