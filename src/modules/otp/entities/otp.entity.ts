import { AbstractBaseEntity } from '../../../../src/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Otp extends AbstractBaseEntity {
  @Column({ nullable: false })
  token: string;

  @Column({ nullable: false })
  email: string;
}
