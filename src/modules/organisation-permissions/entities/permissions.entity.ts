import { Entity, Column, ManyToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';
import { PermissionCategory } from '../helpers/PermissionCategory';

@Entity()
export class Permissions extends AbstractBaseEntity {
  @Column({
    type: 'enum',
    enum: PermissionCategory,
    unique: true,
  })
  category: PermissionCategory;

  @Column({ type: 'boolean', nullable: false })
  permission_list: boolean;

  @ManyToOne(() => OrganisationRole, role => role.permissions, { eager: false })
  role: OrganisationRole;
}
