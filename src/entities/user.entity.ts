import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Testimonial } from './testimonials.entity';
import { Review } from './reviews.entity';
import { Sms } from './sms.entity';
import { JobListing } from './job-listing.entity';
import { Organisation } from './org.entity';
import { Invite } from './invite.entity';
import { Sessions } from './sessions.entity';
import { Roles } from './roles.entity';

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

  @OneToMany(() => Testimonial, testimonial => testimonial.user)
  testimonials: Testimonial[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Sms, sms => sms.sender)
  sms: Sms[];

  @OneToMany(() => JobListing, jobListing => jobListing.user)
  jobListings: JobListing[];

  @OneToMany(() => Organisation, organisation => organisation.owner)
  ownedOrganisations: Organisation[];

  @OneToMany(() => Organisation, organisation => organisation.creator)
  createdOrganisations: Organisation[];

  @OneToMany(() => Invite, invite => invite.user)
  invites: Invite[];

  @OneToMany(() => Sessions, session => session.user)
  sessions: Sessions[];

  @ManyToOne(() => Roles, roles => roles.users)
  role: Roles;
}
