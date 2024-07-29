import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from './../../../entities/base.entity';

@Entity()
export class Regions extends AbstractBaseEntity {
  @Column({ nullable: true })
  regionCode: string;

  @Column()
  regionName: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column('int', { nullable: true })
  status: number;

  @Column({ type: 'timestamp' })
  modifiedOn: Date;

  @Column()
  modifiedBy: string;
}
