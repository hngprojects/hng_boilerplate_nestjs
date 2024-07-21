import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Organisation } from './org.entity';
import { User } from './user.entity';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  roleName: string;

  @Column()
  isActive: boolean;

  @ManyToOne(() => Organisation, organisation => organisation.roles)
  organisation: Organisation;

  @OneToMany(() => User, user => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
