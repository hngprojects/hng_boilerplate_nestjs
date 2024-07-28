import { User, UserType } from '../../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export const updateNotificationMock = {
  findOne: jest.fn(),
  save: jest.fn(),
};

export const mockUser: User = {
  id: 'validUserId',
  created_at: new Date(),
  updated_at: new Date(),
  first_name: 'John',
  last_name: 'Smith',
  email: 'john.smith@example.com',
  password: 'pass123',
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
  notifications: [],
};
