import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from '../../entities/base.entity';

@Entity('help_centers')
export class HelpCenter extends AbstractBaseEntity {
  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  author: string;
}
