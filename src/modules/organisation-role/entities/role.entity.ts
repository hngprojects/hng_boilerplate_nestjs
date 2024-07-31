import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { Permissions } from '../../organisation-permissions/entities/permissions.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Role extends AbstractBaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Permissions, permission => permission.role, { eager: false })
  permissions: Permissions[];

  @ManyToOne(() => Organisation, organisation => organisation.role, { eager: false })
  organisation: Organisation[];
}
