import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'waitlist' })
export class Waitlist extends AbstractBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({ nullable: false, default: false })
  status: boolean;

  @Column({ nullable: true })
  url_slug: string;
}
