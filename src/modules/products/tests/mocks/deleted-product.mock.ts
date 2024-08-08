import { randomUUID } from 'crypto';
import { orgMock } from '../../../organisations/tests/mocks/organisation.mock';
import { Product, StockStatusType } from '../../entities/product.entity';

enum ProductSizeType {
  SMALL = 'Small',
  STANDARD = 'Standard',
  LARGE = 'Large',
}

export const deletedProductMock: Product = {
  id: randomUUID(),
  name: 'TV',
  description: '',
  stock_status: StockStatusType.LOW_STOCK,
  image: '',
  price: 12,
  category: 'Fashion',
  quantity: 7,
  cost_price: 10,
  orderItems: [],
  cart: [],
  size: ProductSizeType.SMALL,
  org: orgMock,
  created_at: new Date(),
  updated_at: new Date(),
};
