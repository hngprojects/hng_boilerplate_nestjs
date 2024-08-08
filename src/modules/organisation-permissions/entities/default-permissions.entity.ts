import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { PermissionCategory } from '../helpers/PermissionCategory';

@Entity()
export class DefaultPermissions extends AbstractBaseEntity {
  @Column({
    type: 'enum',
    enum: PermissionCategory,
    unique: true,
  })
  category: PermissionCategory;

  @Column({ type: 'boolean', nullable: false })
  permission_list: boolean;
}
