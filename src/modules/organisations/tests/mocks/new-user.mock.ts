import { User } from '../../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { Profile } from '../../../profile/entities/profile.entity';

export enum UserType {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

const profileMock: Profile = {
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
  user_id: null,
};

export const newUser: User = {
  id: uuidv4(),
  created_at: new Date(),
  updated_at: new Date(),
  first_name: 'Marie',
  last_name: 'James',
  email: 'marie.james@example.com',
  password: 'pass123',
  hashPassword: async () => {},
  is_active: true,
  attempts_left: 3,
  time_left: 3600,
  owned_organisations: [],
  created_organisations: [],
  phone: '0890096899',
  organisationMembers: [],
  invites: [],
  testimonials: [],
  jobs: [],
  secret: 'secret',
  is_2fa_enabled: false,
  profile: profileMock,
  user_type: UserType.ADMIN,
};
