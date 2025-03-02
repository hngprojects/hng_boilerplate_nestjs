import { Column, Entity, ManyToOne, DeleteDateColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Testimonial extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.testimonials, { nullable: false })
  user: User;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  content: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
