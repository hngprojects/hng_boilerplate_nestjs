import { AbstractBaseEntity } from 'src/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Waitlist extends AbstractBaseEntity{
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  fullName: string;
}
