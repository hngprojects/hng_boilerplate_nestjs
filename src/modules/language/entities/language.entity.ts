import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Language extends AbstractBaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  native_name: string;

  @Column({ type: 'enum', enum: ['LTR', 'RTL'] })
  direction: 'LTR' | 'RTL';
}
