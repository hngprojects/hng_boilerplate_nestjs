import { User } from '../../user/entities/user.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';

@Entity()
export class Organisation extends AbstractBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  industry: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  country: string;

  @Column('text', { nullable: false })
  address: string;

  @ManyToOne(() => User, user => user.ownedOrganisations, { nullable: false })
  owner: User;

  @Column({ nullable: false })
  state: string;

  @ManyToOne(() => User, user => user.createdOrganisations, { nullable: false })
  creator: User;

  @Column('boolean', { default: false, nullable: false })
  isDeleted: boolean;
}
