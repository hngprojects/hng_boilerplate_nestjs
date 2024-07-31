import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class ContactUs extends AbstractBaseEntity {
  @Column('varchar', { nullable: false })
  name: string;

  @Column('varchar', { nullable: false })
  email: string;

  @Column('text', { nullable: false })
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
