import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class Permissions extends AbstractBaseEntity {
  @Column()
  title: string;
}
