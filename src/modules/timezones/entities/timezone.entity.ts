import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Timezone extends AbstractBaseEntity {
  @Column({ unique: true })
  timezone: string;

  @Column()
  gmtOffset: string;

  @Column({ nullable: true })
  description: string;
}
