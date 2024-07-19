import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('waitlist')
export class Waitlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  fullName: string;
}
