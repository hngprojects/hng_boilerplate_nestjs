import { v4 as uuidv4 } from 'uuid';
import { Organisation } from '../../entities/organisations.entity';
import { Profile } from '../../../profile/entities/profile.entity';
import { OrganisationMember } from '../../entities/org-members.entity';
import { OrganisationRole } from '../../../organisation-role/entities/organisation-role.entity';
import { mockUser } from './user.mock';

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
  };

  // Create a mock object that matches the OrganisationRole interface
  const organisationRoleMock: OrganisationRole = {
    id: uuidv4(),
    name: 'Admin',
    description: 'Administrator role with full permissions',
    permissions: [],
    organisation: null,
    organisationMembers: [],
    created_at: new Date(),
    updated_at: new Date(),
  };

  const orgMemberMock: OrganisationMember = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    user_id: mockUser,
    role: organisationRoleMock,
    organisation_id: null,
    profile_id: profileMock,
    suspended: false,
    active_member: true,
    left_workspace: false,
  };

  const ownerAndCreator = {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    password: 'pass123',
    is_two_factor_enabled: false,
    two_factor_secret: 'some-secret',
    backup_codes: [],
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
    notifications: [],
    notification_settings: [],
    user_type: UserType.ADMIN,
    secret: 'secret',
    is_2fa_enabled: false,
    products: [],
    profile: profileMock,
    organisationMembers: [orgMemberMock],
    blogs: [],
  };

  return {
    id: 'some-id',
    name: 'John & Co',
    description: 'An imports organisation',
    email: 'johnCo@example.com',
    industry: 'Import',
    type: 'General',
    country: 'Nigeria',
    address: 'Street 101 Building 26',
    state: 'Lagos',
    owner: ownerAndCreator,
    creator: { ...ownerAndCreator, user_type: UserType.USER },
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
