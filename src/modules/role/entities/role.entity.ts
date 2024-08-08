import { Entity, Column, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Permissions } from '../../permissions/entities/permissions.entity';
import { OrganisationUserRole } from './organisation-user-role.entity';

@Entity({ name: 'defaultRole' })
export class Role extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Permissions, permission => permission.id)
  permissions: Permissions[];

  @OneToMany(() => OrganisationUserRole, userRole => userRole.role)
  user_roles: OrganisationUserRole[];
}
