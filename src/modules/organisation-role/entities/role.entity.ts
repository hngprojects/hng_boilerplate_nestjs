import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { RoleCategory } from '../helpers/RoleCategory';

@Entity({ name: 'defaultRole' })
export class DefaultRole extends AbstractBaseEntity {
  @Column({
    type: 'enum',
    enum: RoleCategory,
    unique: true,
  })
  name: RoleCategory;

  @Column({ type: 'text', nullable: true })
  description: string;
}
