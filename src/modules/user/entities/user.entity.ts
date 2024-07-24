import * as bcrypt from 'bcrypt';
import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { Testimonial } from '../../testimonials/entities/testimonials.entity';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

@Entity()
export class User extends AbstractBaseEntity {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  is_active: boolean;

  @Column({ nullable: true })
  attempts_left: number;

  @Column({ nullable: true })
  time_left: number;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  user_type: UserType;

  @OneToMany(() => Organisation, organisation => organisation.owner)
  owned_organisations: Organisation[];

  @OneToMany(() => Organisation, organisation => organisation.creator)
  created_organisations: Organisation[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Testimonial, testimonial => testimonial.user)
  testimonials: Testimonial[];
}
