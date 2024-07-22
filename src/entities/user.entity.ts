import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { JobListing } from './job-listing.entity';
import { Organisation } from './org.entity';

@Entity()
export class User {
  [x: string]: any;
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, name: 'first_name' })
  firstName: string;

  @Column({ nullable: false, name: 'last_name' })
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => JobListing, jobListing => jobListing.user)
  jobListings: JobListing[];

  @OneToMany(() => Organisation, organisation => organisation.owner)
  ownedOrganisations: Organisation[];

  @OneToMany(() => Organisation, organisation => organisation.creator)
  createdOrganisations: Organisation[];
}
