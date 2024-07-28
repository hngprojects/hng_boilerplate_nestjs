import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Job extends AbstractBaseEntity {
  @Column('text', { nullable: false })
  title: string;

  @Column('text', { nullable: false })
  description: string;

  @Column('text', { nullable: false })
  location: string;

  @Column({ type: 'timestamp', nullable: false })
  deadline: string;

  @Column({
    type: 'enum',
    enum: ['below_30k', '30k_to_50k', '50k_to_70k', '70k_to_100k', '100k_to_150k', 'Above_150k'],
    nullable: false,
  })
  salary_range: string;

  @Column({ type: 'enum', enum: ['full-time', 'part-time', 'internship', 'contract'], default: 'full-time' })
  job_type: string;

  @Column({ type: 'enum', enum: ['remote', 'onsite'], default: 'remote' })
  job_mode: string;

  @Column('text', { nullable: false })
  company_name: string;

  @Column('boolean', { nullable: false, default: false })
  is_deleted: boolean;

  @ManyToOne(() => User, user => user.jobs, { nullable: false })
  user: User;
}
