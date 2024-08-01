import { Entity, Column, ManyToOne } from 'typeorm';
import { Role } from '../../organisation-role/entities/role.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Permissions extends AbstractBaseEntity {
  @Column({ type: 'text', unique: true })
  category: string;

  @Column({ type: 'boolean', nullable: false })
  permission_list: boolean;

  @ManyToOne(() => Role, role => role.permissions, { eager: false })
  role: Role;
}
