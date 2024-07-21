import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organisation } from './org.entity';
import { User } from './user.entity';

@Entity()
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  email: string;

  @ManyToOne(() => Organisation, organisation => organisation.invites, { nullable: false, onDelete: 'CASCADE' })
  organisation: Organisation;

  @ManyToOne(() => User, user => user.invites, { nullable: false })
  user: User;

  @Column('enum', { enum: ['pending', 'approved', 'rejected'], nullable: false })
  status: string;
}
