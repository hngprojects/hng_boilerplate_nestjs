import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne } from 'typeorm';

@Entity('newsletters')
export class Newsletter extends AbstractBaseEntity {
  @Column({ unique: true })
  email: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
