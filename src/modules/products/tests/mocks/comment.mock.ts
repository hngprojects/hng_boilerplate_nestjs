import { mockUser } from '../../../user/tests/mocks/user.mock';
import { Comment } from '../../../comments/entities/comments.entity';
import { productMock } from './product.mock';

export const mockComment: Comment = {
  id: 'Comment1',
  comment: 'First comment',
  user: mockUser,
  product: productMock,
  created_at: new Date(),
  updated_at: new Date(),
};
