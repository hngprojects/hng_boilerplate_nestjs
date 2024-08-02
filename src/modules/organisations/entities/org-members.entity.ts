import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from './organisations.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

@Entity()
export class OrganisationMember extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.organisationMembers)
  user_id: User;

  @ManyToOne(() => Organisation, organisation => organisation.organisationMembers)
  organisation_id: Organisation;

  @ManyToOne(() => OrganisationRole, role => role.organisationMembers)
  role: OrganisationRole;

  @ManyToOne(() => Profile)
  profile_id: Profile;
}
