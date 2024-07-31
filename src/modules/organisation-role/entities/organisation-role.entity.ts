import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { DefaultPermissions } from '../../organisation-permissions/entities/default-permissions.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';

@Entity('roles')
export class OrganisationRole extends AbstractBaseEntity {
  @ApiProperty({ description: 'The name of the role', maxLength: 50 })
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ description: 'The description of the role', maxLength: 200, required: false })
  @Column({ length: 200, nullable: true })
  description: string;

  @OneToMany(() => DefaultPermissions, permission => permission.role)
  permissions: DefaultPermissions[];

  @ManyToOne(() => Organisation, organisation => organisation.roles)
  organisation: Organisation;
}
