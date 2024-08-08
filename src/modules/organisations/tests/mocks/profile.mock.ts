import { Profile } from '../../../profile/entities/profile.entity';

export const profileMock: Profile = {
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
  deactivated: false,
  deactivation_reason: 'none',
  timezones: 'America/New_York',
  profile_pic_url: '',
  created_at: new Date(),
  updated_at: new Date(),
};
