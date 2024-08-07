import { Testimonial } from '../../entities/testimonials.entity';
import { mockUser } from '../../../organisations/tests/mocks/user.mock';

export const testimonialsMock: Testimonial[] = [
  {
    id: '1',
    user: mockUser,
    name: 'Mary Jane',
    content: 'Excellent Work!',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '2',
    user: mockUser,
    name: 'Clara James',
    content: 'Excellent Work! Highly Recommend',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '3',
    user: mockUser,
    name: 'Jamie Waen',
    content: 'Organized and quality work!',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '4',
    user: mockUser,
    name: 'Joanne',
    content: 'Excellent Work!',
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: '5',
    user: mockUser,
    name: 'Mary Jane',
    content: 'Highly Recommend!',
    created_at: new Date(),
    updated_at: new Date(),
  },
];
