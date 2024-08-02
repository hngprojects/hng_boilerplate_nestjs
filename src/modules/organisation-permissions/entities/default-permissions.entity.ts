import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { PermissionCategory } from '../helpers/PermissionCategory';
import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';

@Entity()
export class DefaultPermissions extends AbstractBaseEntity {
  @Column({
    type: 'enum',
    enum: PermissionCategory,
    unique: true,
  })
  category: PermissionCategory;

  @Column({ type: 'boolean', nullable: false })
  permission_list: boolean;

  @ManyToOne(() => OrganisationRole, role => role.organisation)
  role: OrganisationRole;
}
