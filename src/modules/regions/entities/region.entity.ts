import { Entity, Column } from 'typeorm';
import { AbstractBaseEntity } from 'src/entities/base.entity';

@Entity()
export class Region extends AbstractBaseEntity {
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
