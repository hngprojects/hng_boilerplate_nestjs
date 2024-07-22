import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column('text', { nullable: false })
  description: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  industry: string;

  @Column({ nullable: false })
  type: string;

  @Column({ nullable: false })
  country: string;

  @Column('text', { nullable: false })
  address: string;

  @ManyToOne(() => User, user => user.ownedOrganisations, { nullable: false })
  owner: User;

  @Column({ nullable: false })
  state: string;

  @ManyToOne(() => User, user => user.createdOrganisations, { nullable: false })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('boolean', { default: false, nullable: false })
  isDeleted: boolean;
}
