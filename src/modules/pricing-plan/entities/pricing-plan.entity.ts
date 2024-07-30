import { AbstractBaseEntity } from 'src/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Plans extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  price: string;

  @Column()
  features: [string];
}
