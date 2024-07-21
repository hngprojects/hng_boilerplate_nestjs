import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  firstName: string;

  @Column({ nullable: false })
  lastName: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @OneToMany(() => Sessions, session => session.user)
  sessions: Sessions[];

  @Column({ nullable: false, default: false })
  is2faEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Roles, roles => roles.users)
  role: Roles;

  @OneToMany(() => Testimonial, testimonial => testimonial.user)
  testimonials: Testimonial[];

  @OneToMany(() => Review, review => review.user)
  reviews: Review[];

  @OneToMany(() => Sms, sms => sms.sender)
  sms: Sms[];

  @OneToMany(() => JobListing, jobListing => jobListing.user)
  jobListings: JobListing[];

  @ManyToMany(() => Organisation)
  @JoinTable()
  organisations: Organisation[];

  @OneToMany(() => Organisation, organisation => organisation.owner)
  ownedOrganisations: Organisation[];

  @OneToMany(() => Organisation, organisation => organisation.creator)
  createdOrganisations: Organisation[];

  @OneToMany(() => Invite, invite => invite.user)
  invites: Invite[];
}
