import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity'; // Assume you have a BaseEntity defined

@Entity()
export class Timezone extends AbstractBaseEntity {
  @Column()
  timezone: string;

  @Column()
  gmtOffset: string;

  @Column({ nullable: true })
  description?: string;
}
