import { v4 as uuidv4 } from 'uuid';
import { Organisation } from '../../entities/organisations.entity';
import { Profile } from '../../../profile/entities/profile.entity';
import { OrganisationMember } from '../../entities/org-members.entity';
import { User } from '../../../user/entities/user.entity';
import { OrganisationRole } from '../../../organisation-role/entities/organisation-role.entity';
export enum UserType {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

export const createMockProfile = (): Profile => {
  return {
    id: uuidv4(),
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
};

export const createMockUser = (): User => {
  const profile = createMockProfile();

  return {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    first_name: 'Senku',
    last_name: 'Ishigami',
    email: 'senku.ishigami@example.com',
    password: 'pass1234',
    jobs: [],
    phone: '+1234567890',
    hashPassword: async () => {},
    is_active: true,
    attempts_left: 3,
    time_left: 3600,
    owned_organisations: [],
    created_organisations: [],
    testimonials: [],
    user_type: UserType.ADMIN,
    secret: 'secret',
    is_2fa_enabled: false,
    profile: profile,
    organisationMembers: [],
    backup_codes: [],
    notifications: [],
    notification_settings: null,
  };
};

export const createMockOrganisation = (): Organisation => {
  const ownerAndCreator = createMockUser();

  return {
    id: uuidv4(),
    name: 'Atarva',
    description: 'A futurist organisation',
    email: 'atarva@example.com',
    industry: 'Numeric',
    type: 'General',
    country: 'USA',
    address: 'Street 101 Building 26',
    state: 'Texas',
    owner: ownerAndCreator,
    creator: ownerAndCreator,
    created_at: new Date(),
    updated_at: new Date(),
    isDeleted: false,
    preferences: [],
    invites: [],
    organisationMembers: [],
    products: [],
    role: [],
  };
};

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

export const createMockOrganisationMember = (): OrganisationMember => {
  const profileMock = createMockProfile();
  const userMock = createMockUser();
  const organisationMock = createMockOrganisation();

  return {
    id: uuidv4(),
    created_at: new Date(),
    updated_at: new Date(),
    user_id: userMock,
    role: organisationRoleMock,
    organisation_id: organisationMock,
    profile_id: profileMock,
  };
};

export const orgMemberMock = createMockOrganisationMember();
