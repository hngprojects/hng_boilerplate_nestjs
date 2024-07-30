import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('permissions')
export class OrganisationPermission extends AbstractBaseEntity {
  @Column('varchar')
  category: string;

  @Column('json')
  permission_list: Record<string, boolean>;

  @ManyToOne(() => OrganisationRole, role => role.permissions)
  role: OrganisationRole;
}
