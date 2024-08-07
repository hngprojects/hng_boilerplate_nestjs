import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from './organisations.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';

@Entity()
export class OrganisationMember extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.organisationMembers)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @ManyToOne(() => Organisation, organisation => organisation.organisationMembers)
  @JoinColumn({ name: 'organisation_id' })
  organisation_id: Organisation;

  @ManyToOne(() => OrganisationRole, role => role.organisationMembers)
  @JoinColumn({ name: 'role_id' })
  role: OrganisationRole;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'profile_id' })
  profile_id: Profile;

  @DeleteDateColumn()
  deletedAt?: Date;
}
