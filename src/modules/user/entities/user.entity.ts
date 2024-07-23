import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Product } from 'src/modules/products/entities/product.entity';

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

  @OneToMany(() => Product, product => product.user)
  products: Product[];

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
