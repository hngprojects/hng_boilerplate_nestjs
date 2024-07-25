import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from './../../../entities/base.entity';

@Entity()
export class Regions extends AbstractBaseEntity {
  @Column()
  regionCode: string;

  @Column()
  regionName: string;

  @Column()
  countryCode: string;

  @Column('int')
  status: number;

  @Column({ type: 'timestamp' })
  modifiedOn: Date;

  @Column()
  modifiedBy: string;
}
