import { Entity, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OrganisationPreference } from './org-preferences.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Invite } from '../../invite/entities/invite.entity';
import { Product } from '../../products/entities/product.entity';
import { OrganisationUserRole } from '../../role/entities/organisation-user-role.entity';

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

  @ManyToOne(() => User, user => user.owned_organisations, { nullable: false })
  owner: User;

  @Column({ nullable: false })
  state: string;

  @Column('boolean', { default: false, nullable: false })
  isDeleted: boolean;

  @OneToMany(() => Product, product => product.org, { cascade: true })
  products: Product[];

  @OneToMany(() => OrganisationPreference, preference => preference.organisation)
  preferences: OrganisationPreference[];

  @OneToMany(() => Invite, invite => invite.organisation.id)
  invites: Invite[];

  @ManyToMany(() => User, user => user.organisations)
  @JoinTable({
    name: 'organisation_members',
    joinColumn: {
      name: 'organisation_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members: User[];

  @OneToMany(() => OrganisationUserRole, userRole => userRole.organisation)
  roles: OrganisationUserRole[];

  // @OneToMany(() => OrganisationMember, organisationMember => organisationMember.organisation_id)
  // organisationMembers: OrganisationMember[];
}
