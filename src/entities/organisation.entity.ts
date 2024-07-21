import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn('uuid')
  org_id: string;

  @Column({ nullable: false })
  org_name: string;

  @Column({ nullable: false })
  description: string;

  @ManyToMany(() => User, user => user.organisations)
  users: User[];
}
