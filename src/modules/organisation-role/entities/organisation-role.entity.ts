import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('roles')
export class OrganisationRole extends AbstractBaseEntity {
  @ApiProperty({ description: 'The ID of the role' })
  @Column({ nullable: false })
  id: string;

  @ApiProperty({ description: 'The name of the role', maxLength: 50 })
  @Column({ length: 50, unique: true, nullable: false })
  name: string;

  @ApiProperty({ description: 'The description of the role', maxLength: 200, required: false })
  @Column({ length: 200, nullable: true })
  description: string;
}
