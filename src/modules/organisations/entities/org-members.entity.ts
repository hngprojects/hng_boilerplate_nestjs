import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from './organisations.entity';
import { Profile } from '../../profile/entities/profile.entity';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
  GUEST = 'guest',
}

@Entity()
export class OrganisationMember extends AbstractBaseEntity {
  @Column({ nullable: false })
  user_id: string;

  @Column({ nullable: false })
  organisation_id: string;

  @Column({ nullable: false })
  profile_id: string;

  @ManyToOne(() => User, user => user.organisationMembers)
  user: User;

  @ManyToOne(() => Organisation, organisation => organisation.organisationMembers)
  organisation: Organisation;

  @Column({
    type: 'enum',
    enum: MemberRole,
    default: MemberRole.MEMBER,
  })
  role: string;

  @ManyToOne(() => Profile)
  profile: Profile;
}
