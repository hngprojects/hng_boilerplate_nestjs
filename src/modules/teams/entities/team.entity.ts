import { isInstance } from 'class-validator';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('teams')
export class Team extends AbstractBaseEntity {
  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  image: string;

  @Column()
  facebook: string;

  @Column()
  twitter: string;

  @Column()
  instagram: string;
}
