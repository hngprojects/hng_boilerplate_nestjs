import { randomUUID } from 'crypto';
import { ProductComment } from '../entities/product-comment.entity';

const userMockId = 'user-mock-id';
const productMockId = 'product-mock-id';
export const productCommentMock: ProductComment = {
  id: randomUUID(),
  comment: 'Great product!',
  user: { id: userMockId } as any,
  product: { id: productMockId } as any,
  created_at: new Date(),
  updated_at: new Date(),
};
