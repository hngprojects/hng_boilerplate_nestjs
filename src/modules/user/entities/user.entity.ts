import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import * as crypto from 'crypto';
import { promisify } from 'util';
import * as bcrypt from 'bcryptjs';
import { AbstractBaseEntity } from '../../../entities/base.entity';
import { Testimonial } from '../../../modules/testimonials/entities/testimonials.entity';
import { Invite } from '../../invite/entities/invite.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { Product } from '../../../modules/products/entities/product.entity';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationMember } from '../../organisations/entities/org-members.entity';

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

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  is_active: boolean;

  @Column({ nullable: true })
  is_2fa_enabled: boolean;

  @Column({ nullable: true })
  totp_code: number;

  @Column({ nullable: true })
  backup_codes_2fa: string;

  @Column({ nullable: true })
  attempts_left: number;

  @Column({ nullable: true })
  time_left: number;

  @Column({ nullable: true })
  secret: string;

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

  @OneToMany(() => Invite, invite => invite.user)
  invites: Invite[];

  @OneToOne(() => Profile, profile => profile.user_id)
  @JoinColumn()
  profile: Profile;

  @OneToMany(() => Testimonial, testimonial => testimonial.user)
  testimonials: Testimonial[];

  @OneToMany(() => OrganisationMember, organisationMember => organisationMember.organisation_id)
  organisationMembers: OrganisationMember[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeInsert()
  @BeforeUpdate()
  async encryptBackupCodes(): Promise<void> {
    if (!this.backup_codes_2fa) return;

    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(16);
    const password = process.env.BACKUP_CODES_2FA_PASSWORD || 'somePasswordForMyAPP';

    const key = (await promisify(crypto.scrypt)(password, salt, 32)) as Buffer;
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv);
    const encryptedBackupCodes = Buffer.concat([cipher.update(this.backup_codes_2fa), cipher.final()]);

    this.backup_codes_2fa = iv.toString('hex') + ':' + encryptedBackupCodes.toString('hex');
  }
}
