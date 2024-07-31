import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';

@Entity()
export class Invite extends AbstractBaseEntity {
  @Column({ nullable: false })
  token: string;

  @ManyToOne(() => Organisation, organisation => organisation.invites, { nullable: false, onDelete: 'CASCADE' })
  organisation: Organisation;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  isGeneric: boolean;

  @Column({ default: false })
  isAccepted: boolean;
}
