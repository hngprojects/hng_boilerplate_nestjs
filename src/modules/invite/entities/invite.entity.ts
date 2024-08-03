import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { User } from '../../../modules/user/entities/user.entity';

@Entity()
export class Invite extends AbstractBaseEntity {
  @Column({ nullable: false })
  token: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: false })
  isGeneric: boolean;

  @Column({ default: false })
  isAccepted: boolean;

  @ManyToOne(() => Organisation, organisation => organisation.invites, { nullable: false, onDelete: 'CASCADE' })
  organisation: Organisation;

  @ManyToOne(() => User, user => user.invites)
  user: User;
}
