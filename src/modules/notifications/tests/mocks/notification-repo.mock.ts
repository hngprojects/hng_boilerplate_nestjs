import { User, UserType } from '../../../user/entities/user.entity';

export const mockNotificationRepository = {
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
  products: [],
};
