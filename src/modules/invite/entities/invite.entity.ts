import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
// import { User } from '../../user/entities/user.entity';

@Entity()
export class Invite extends AbstractBaseEntity {
  // @Column({ nullable: false })
  // email: string;

  @ManyToOne(() => Organisation, organisation => organisation.invites, { nullable: false, onDelete: 'CASCADE' })
  organisation: Organisation;

  // @ManyToOne(() => User, user => user.invites, { nullable: false })
  // user: User;

  @Column('enum', { enum: ['pending', 'approved', 'rejected'], nullable: false })
  status: string;
}
