import { v4 as uuidv4 } from 'uuid';

import { Profile } from '../../../profile/entities/profile.entity';
import { Organisation } from '../../entities/organisations.entity';

export enum UserType {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

export const createMockOrganisation = (): Organisation => {
  const org = new Organisation();
  org.id = uuidv4();

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
    status: 'Hello from the children of planet Earth',
    phone: '+1234567890',
    hashPassword: async () => {},
    is_active: true,
    attempts_left: 3,
    time_left: 3600,
    owned_organisations: [],
    invites: [],
    testimonials: [],
    notifications: [],
    notification_settings: [],
    secret: 'secret',
    is_2fa_enabled: false,
    products: [],
    profile: profileMock,
    blogs: [],
    comments: [],
    cart: [],
    organisations: [],
    roles: [],
  };

  return {
    ...org,
    name: 'John & Co',
    description: 'An imports organisation',
    email: 'johnCo@example.com',
    industry: 'Import',
    type: 'General',
    country: 'Nigeria',
    address: 'Street 101 Building 26',
    state: 'Lagos',
    owner: ownerAndCreator,
    created_at: new Date(),
    updated_at: new Date(),
    isDeleted: false,
    preferences: [],
    invites: [],
    products: [],
    members: [ownerAndCreator],
    roles: [],
  };
};

export const orgMock = createMockOrganisation();
