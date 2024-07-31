import { randomUUID } from 'crypto';
import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { Product, ProductStatusType } from '../../entities/product.entity';
import { ProductSizeType } from '../../entities/product-variant.entity';

export const productMock: Product = {
  id: randomUUID(),
  name: 'TV',
  description: '',
  variants: [
    {
      id: randomUUID(),
      price: 35,
      quantity: 3,
      size: ProductSizeType.STANDARD,
      product: new Product(),
    },
  ],
  status: ProductStatusType.LOW_STOCK,
  image: '',
  org: orgMock,
  created_at: new Date(),
  updated_at: new Date(),
};
