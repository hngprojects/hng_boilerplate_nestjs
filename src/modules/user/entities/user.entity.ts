import * as bcrypt from 'bcryptjs';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Job } from '../../../modules/jobs/entities/job.entity';
import { NotificationSettings } from '../../../modules/notification-settings/entities/notification-setting.entity';
import { Notification } from '../../../modules/notifications/entities/notifications.entity';
import { Testimonial } from '../../../modules/testimonials/entities/testimonials.entity';
import { Blog } from '../../blogs/entities/blog.entity';
import { Comment } from '../../comments/entities/comments.entity';
import { OrganisationMember } from '../../organisations/entities/org-members.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { Profile } from '../../profile/entities/profile.entity';

export enum UserType {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

@Entity({ name: 'users' })
export class User extends AbstractBaseEntity {
  @Column({ nullable: false })
  first_name: string;

  @Column({ nullable: false })
  last_name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: false, nullable: true })
  status: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  is_active: boolean;

  @Column('simple-array', { nullable: true })
  backup_codes: string[];

  @Column({ nullable: true })
  attempts_left: number;

  @Column({ nullable: true })
  time_left: number;

  @Column({ nullable: true })
  secret: string;

  @Column({ default: false })
  is_2fa_enabled: boolean;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.USER,
  })
  user_type: UserType;

  @OneToMany(() => Organisation, organisation => organisation.owner)
  owned_organisations: Organisation[];

  @OneToMany(() => Organisation, organisation => organisation.creator)
  created_organisations: Organisation[];

  @OneToMany(() => Job, job => job.user)
  jobs: Job[];

  @OneToOne(() => Profile, profile => profile.id)
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @OneToMany(() => Testimonial, testimonial => testimonial.user)
  testimonials: Testimonial[];

  @OneToMany(() => OrganisationMember, organisationMember => organisationMember.organisation_id)
  organisationMembers: OrganisationMember[];

  @OneToMany(() => Blog, blog => blog.author)
  blogs?: Blog[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToOne(() => NotificationSettings, notification_settings => notification_settings.user)
  notification_settings: NotificationSettings[];

  @OneToMany(() => Comment, comment => comment.user)
  comments?: Comment[];
}
