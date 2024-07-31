import { Profile } from '../../../profile/entities/profile.entity';
import { User } from '../../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

export enum UserType {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'vendor',
}

const profile: Profile = new Profile();
profile.id = uuidv4();

export const newUser: User = {
  id: uuidv4(),
  created_at: new Date(),
  updated_at: new Date(),
  first_name: 'Marie',
  last_name: 'James',
  email: 'marie.james@example.com',
  phone: '0896789679',
  password: 'pass123',
  secret: '',
  is_2fa_enabled: false,
  hashPassword: async () => {},
  is_active: true,
  attempts_left: 3,
  time_left: 3600,
  owned_organisations: [],
  created_organisations: [],
  user_type: UserType.USER,
  organisationMembers: [],
  jobs: [],
  invites: [],
  profile: profile,
  testimonials: [],
  notifications: [],
  notifications_settings: [],
};
