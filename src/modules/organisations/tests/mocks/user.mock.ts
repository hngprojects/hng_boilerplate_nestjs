import { orgMemberMock } from './organisation-member.mock';
import { UserType } from './organisation.mock';
import { profileMock } from './profile.mock';

export const mockUser = {
  id: 'user123',
  created_at: new Date(),
  updated_at: new Date(),
  first_name: 'John',
  last_name: 'Smith',
  email: 'john.smith@example.com',
  password: 'pass123',
  status: 'Hello from the children of planet Earth',
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
  user_type: 'admin' as UserType,
  secret: 'secret',
  is_2fa_enabled: false,
  products: [],
  profile: profileMock,
  organisationMembers: [orgMemberMock],
  blogs: null,
  comments: [],
};
