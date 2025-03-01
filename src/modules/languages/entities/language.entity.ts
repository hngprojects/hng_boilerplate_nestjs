import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { User } from '@modules/user/entities/user.entity';

@Entity()
export class Language extends AbstractBaseEntity {
  @Column({ unique: true })
  language: string;

  @Column({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @ManyToMany(() => User, user => user.languages)
  @JoinTable()
  users?: User[];
}
