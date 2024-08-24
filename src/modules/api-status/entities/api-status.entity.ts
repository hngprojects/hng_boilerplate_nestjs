import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { Request } from './request.entity';

export enum ApiStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

@Entity('api_health')
export class ApiHealth extends AbstractBaseEntity {
  @Column()
  api_group: string;

  @Column({
    type: 'enum',
    enum: ApiStatus,
    default: ApiStatus.OPERATIONAL,
  })
  status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastChecked: Date;

  @Column()
  details: string;

  @OneToMany(() => Request, request => request.api_health)
  requests: Request[];
}
