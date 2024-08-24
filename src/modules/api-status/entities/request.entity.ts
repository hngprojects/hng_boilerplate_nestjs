import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column, ManyToOne } from 'typeorm';
import { ApiHealth } from './api-status.entity';

@Entity('request')
export class Request extends AbstractBaseEntity {
  @Column()
  requestName: string;

  @Column({ nullable: true })
  status: string;

  @Column()
  requestUrl: string;

  @Column()
  responseTime: number;

  @Column()
  statusCode: number;

  @Column('simple-array', { nullable: true })
  errors: string[];

  @ManyToOne(() => ApiHealth, apiHealth => apiHealth.requests)
  api_health: ApiHealth;
}
