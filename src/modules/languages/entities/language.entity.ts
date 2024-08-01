import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Language extends AbstractBaseEntity {
  @Column({ unique: true })
  language: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;
}
