import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Role } from './role.entity';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';

@Entity('organization_user_role')
export class OrganisationUserRole extends AbstractBaseEntity {
  @ManyToOne(() => Role, role => role.user_roles)
  role: Role;

  @ManyToOne(() => User, user => user.roles)
  user: User;

  @ManyToOne(() => Organisation, organisation => organisation.roles)
  organisation: Organisation;
}
