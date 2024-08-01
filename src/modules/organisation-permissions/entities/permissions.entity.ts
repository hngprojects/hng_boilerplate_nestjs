import { Entity, Column, ManyToOne } from 'typeorm';
import { OrganisationRole } from '../../organisation-role/entities/organisation-role.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Permissions extends AbstractBaseEntity {
  @Column({ type: 'text' })
  category: string;

  @Column({ type: 'boolean', nullable: false })
  permission_list: boolean;

  @ManyToOne(() => OrganisationRole, role => role.permissions, { eager: false })
  role: OrganisationRole;
}
