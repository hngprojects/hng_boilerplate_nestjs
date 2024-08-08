import { Profile } from '../../../profile/entities/profile.entity';
import { User, UserType } from '../../../user/entities/user.entity';

export const mockNotificationRepository = {
  create: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  save: jest.fn().mockResolvedValue({}),
  createQueryBuilder: jest.fn(() => ({
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn().mockResolvedValue({}),
  })),
};

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

export const mockUser: User = {
  id: 'validUserId',
  created_at: new Date(),
  updated_at: new Date(),
  first_name: 'John',
  last_name: 'Smith',
  email: 'john.smith@example.com',
  password: 'pass123',
  status: 'Hello from the children of planet Earth',
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
  backup_codes: [],
  notifications: [],
  notification_settings: [],
  organisationMembers: [],
  profile: profileMock,
  phone: '1234-887-09',
  jobs: [],
  blogs: [],
};
