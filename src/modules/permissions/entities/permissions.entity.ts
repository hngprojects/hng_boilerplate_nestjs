import { Entity, Column, ManyToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Role } from '../../../modules/role/entities/role.entity';

@Entity()
export class Permissions extends AbstractBaseEntity {
  @Column()
  title: string;
  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[];
}
