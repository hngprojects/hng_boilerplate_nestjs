import { Profile } from '../entities/profile.entity';

export const mockProfile: Profile = {
  id: 'profile-id',
  created_at: new Date(),
  updated_at: new Date(),
  username: 'testuser',
  jobTitle: 'Software Engineer',
  pronouns: 'he/him',
  department: 'Engineering',
  email: 'testuser@example.com',
  bio: 'A passionate software engineer.',
  social_links: ['https://twitter.com/testuser', 'https://github.com/testuser'],
  language: 'English',
  region: 'US',
  timezones: 'PST',
  profile_pic_url: 'http://example.com/uploads/test.jpg',
  deletedAt: null,
};
