import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Organisation } from './org.entity';

@Entity()
export class OrganisationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  value: string;

  @ManyToOne(() => Organisation, organisation => organisation.preferences, { nullable: false, onDelete: 'CASCADE' })
  organisation: Organisation;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
