import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { Permissions } from '../../organisation-permissions/entities/permissions.entity';
import { OrganisationMember } from '../../organisations/entities/org-members.entity';

@Entity('roles')
export class OrganisationRole extends AbstractBaseEntity {
  @Column({ nullable: false })
  id: string;

  @Column({ length: 50, unique: true, nullable: false })
  name: string;

  @Column({ length: 200, nullable: true })
  description: string;

  @OneToMany(() => Permissions, permission => permission.role, { eager: false })
  permissions: Permissions[];

  @ManyToOne(() => Organisation, organisation => organisation.role, { eager: false })
  organisation: Organisation;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => OrganisationMember, member => member.role)
  organisationMembers: OrganisationMember[];
}
