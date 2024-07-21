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
import { AboutUsAccessToken } from './about-us-access-token.entity';
import { HelpCenterTopic } from './help-center-topic.entity';
import { NotificationSettings } from './notification-settings.entity';
import { Product } from './products.entity';
import { Profile } from './profile.entity';
import { Sessions } from './sessions.entity';
import { Roles } from './roles.entity';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

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

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  userType: UserType;

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

  @OneToMany(() => AboutUsAccessToken, aboutUsAccessToken => aboutUsAccessToken.user)
  aboutUsAccessTokens: AboutUsAccessToken[];

  @OneToMany(() => HelpCenterTopic, topic => topic.user)
  topics: HelpCenterTopic[];

  @OneToMany(() => NotificationSettings, notificationSettings => notificationSettings.user)
  notificationSettings: NotificationSettings[];

  @OneToMany(() => Product, product => product.user)
  products: Product[];

  @OneToMany(() => Profile, profile => profile.user)
  profile: Profile[];

  @ManyToOne(() => Roles, roles => roles.users)
  roles: Roles;
}
