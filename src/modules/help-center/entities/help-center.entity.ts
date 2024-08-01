import { Entity, Column } from 'typeorm';
import { HelpCenter } from '../interface/help-center.interface';
import { AbstractBaseEntity } from '../../../entities/base.entity';

@Entity()
export class HelpCenterEntity extends AbstractBaseEntity implements HelpCenter {

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;

  @Column({ default: 'ADMIN', nullable: false })
  author: string;

}
