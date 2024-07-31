import { v4 as uuidv4 } from 'uuid';
import { Organisation } from '../../entities/organisations.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Profile } from '../../../profile/entities/profile.entity';
import { OrganisationMember } from '../../entities/org-members.entity';

export enum UserType {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

export const createMockOrganisation = (): Organisation => {
  const profileMock: Profile = {
    id: 'some-uuid',
    username: 'mockuser',
    jobTitle: 'Developer',
    pronouns: 'They/Them',
    department: 'Engineering',
    email: 'mockuser@example.com',
    bio: 'A mock user for testing purposes',
    social_links: [],
    language: 'English',
    region: 'US',
    timezones: 'America/New_York',
    profile_pic_url: '',
    created_at: new Date(),
    updated_at: new Date(),
    user_id: null,
  };

  const orgMemberMock: OrganisationMember = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    role: 'admin',
    profile_id: profileMock,
    user_id: null,
    organisation_id: null,
  };

  const ownerAndCreator: User = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    password: 'pass123',
    jobs: [],
    phone: '+1234567890',
    hashPassword: async () => {},
    is_active: true,
    attempts_left: 3,
    time_left: 3600,
    owned_organisations: [],
    created_organisations: [],
    invites: [],
    testimonials: [],
    user_type: UserType.ADMIN,
    secret: 'secret',
    is_2fa_enabled: false,
    profile: profileMock,
    organisationMembers: [orgMemberMock],
    notifications: [],
    notifications_settings: [],
  };

  const creator: User = {
    ...ownerAndCreator,
    async hashPassword() {
      return;
    },
    user_type: UserType.USER,
  };

  return {
    id: uuidv4(),
    name: 'John & Co',
    description: 'An imports organisation',
    email: 'johnCo@example.com',
    industry: 'Import',
    type: 'General',
    country: 'Nigeria',
    address: 'Street 101 Building 26',
    state: 'Lagos',
    owner: ownerAndCreator,
    creator: creator,
    created_at: new Date(),
    updated_at: new Date(),
    isDeleted: false,
    preferences: [],
    invites: [],
    role: null,
    organisationMembers: [orgMemberMock],
    products: [],
  };
};

export const orgMock = createMockOrganisation();
