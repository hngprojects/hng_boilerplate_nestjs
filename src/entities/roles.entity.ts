import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Organisation } from './org.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
