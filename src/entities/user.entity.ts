import { IsString } from 'class-validator';
import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Product } from './product.entity';
import { Organisation } from './organisation.entity';
import { Profile } from './profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(type => Product, product => product.user)
  products: Product[];

  @ManyToMany(() => Organisation, Organisation => Organisation.users)
  @JoinTable()
  organisations: Organisation[];

  @OneToOne(() => Profile, profile => profile.user)
  @JoinColumn()
  profile: Profile;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
}
