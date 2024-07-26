import { User } from '../../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export enum UserType {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

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
  member_organisations: [],
  user_type: UserType.USER,
  invites: [],
  testimonials: [],
  secret: 'secret',
  is_2fa_enabled: false,
};
