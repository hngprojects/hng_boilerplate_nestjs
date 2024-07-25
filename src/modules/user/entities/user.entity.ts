import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Organisation } from '../../../modules/organisations/entities/organisations.entity';
import { Product } from '../../../modules/products/entities/product.entity';
import { Invite } from '../../invite/entities/invite.entity';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

@Entity({ name: 'users' })
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
  @Column({ nullable: true })
  secret: string;
  @Column({ default: false })
  is_2fa_enabled: boolean;
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
  @OneToMany(() => Product, product => product.user, { cascade: true })
  products: Product[];

  @OneToMany(() => Invite, invite => invite.user)
  invites: Invite[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}