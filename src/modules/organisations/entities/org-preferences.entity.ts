import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from './organisations.entity';

@Entity()
export class OrganisationPreference extends AbstractBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  value: string;

  @ManyToOne(() => Organisation, organisation => organisation.preferences, { nullable: false, onDelete: 'CASCADE' })
  organisation: Organisation;
}
