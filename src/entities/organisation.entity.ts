import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Organisation {
  @PrimaryGeneratedColumn()
  org_id: number;

  @Column({ nullable: false })
  org_name: string;

  @Column({ nullable: false })
  description: string;

  @ManyToMany(() => User, user => user.organisations)
  @JoinTable()
  users: User[];
}
