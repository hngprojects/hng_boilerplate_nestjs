import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Permissions } from '../../permissions/entities/permissions.entity';

@Entity({ name: 'roles' })
export class Role extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Permissions, permission => permission.roles, { cascade: true })
  @JoinTable({
    name: 'role_permissions', // This is the join table
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permissions[];
}
