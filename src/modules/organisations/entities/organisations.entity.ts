import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { OrganisationPreference } from './org-preferences.entity';
import { Role } from '../../organisation-role/entities/role.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Invite } from '../../invite/entities/invite.entity';
import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';
import { OrganisationMember } from './org-members.entity';
import { Product } from '../../../modules/products/entities/product.entity';

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

  @ManyToOne(() => User, user => user.created_organisations, { nullable: false })
  creator: User;

  @Column('boolean', { default: false, nullable: false })
  isDeleted: boolean;

  @OneToMany(() => Product, product => product.org, { cascade: true })
  products: Product[];

  @OneToMany(() => OrganisationPreference, preference => preference.organisation)
  preferences: OrganisationPreference[];

  @OneToMany(() => Role, role => role.organisation, { eager: false })
  role: Role[];

  @OneToMany(() => Invite, invite => invite.organisation)
  invites: Invite[];

  @OneToMany(() => OrganisationRole, role => role.organisation)
  roles: OrganisationRole[];

  @OneToMany(() => OrganisationMember, organisationMember => organisationMember.organisation_id)
  organisationMembers: OrganisationMember[];
}
