import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from './../../../entities/base.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from './organisations.entity';
import { Profile } from '../../profile/entities/profile.entity';

@Entity()
export class OrganisationMember extends AbstractBaseEntity {
  @ManyToOne(() => User, user => user.organisationMembers)
  user_id: User;

  @ManyToOne(() => Organisation, organisation => organisation.organisationMembers)
  organisation_id: Organisation;

  @Column()
  role: string;

  @ManyToOne(() => Profile)
  profile_id: Profile;
}
