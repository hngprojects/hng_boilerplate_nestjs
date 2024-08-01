import { randomUUID } from 'crypto';
import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { Product, StockStatusType } from '../../entities/product.entity';
import { ProductSizeType } from '../../entities/product-variant.entity';

export const deletedProductMock: Product = {
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
  stock_status: StockStatusType.LOW_STOCK,
  image: '',
  is_deleted: true,
  org: orgMock,
  created_at: new Date(),
  updated_at: new Date(),
};
