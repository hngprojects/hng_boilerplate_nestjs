import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organisation } from 'src/modules/organisations/entities/organisations.entity';

@Entity('roles')
export class OrganisationRole extends AbstractBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'The unique identifier of the role' })
  @ApiProperty({ description: 'The name of the role', maxLength: 50 })
  @Column({ length: 50, unique: true })
  name: string;

  @ApiProperty({ description: 'The description of the role', maxLength: 200, required: false })
  @Column({ length: 200, nullable: true })
  description: string;

  @ManyToOne(() => Organisation, organisation => organisation.roles, { nullable: false })
  organisation: Organisation;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn()
  deletedAt?: Date;
}
