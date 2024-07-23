import { BeforeInsert, Column, Entity } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractBaseEntity } from './base.entity';

@Entity()
export class User extends AbstractBaseEntity {
  @Column({ nullable: false, name: 'first_name' })
  first_name: string;

  @Column({ nullable: false, name: 'last_name' })
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true, name: 'is_active' })
  is_active: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
