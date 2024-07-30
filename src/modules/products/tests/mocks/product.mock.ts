import { randomUUID } from 'crypto';
import { orgMock } from '../../../../modules/organisations/tests/mocks/organisation.mock';
import { Product, StatusType, StockStatusType } from '../../entities/product.entity';

export const productMock: Product = {
  id: randomUUID(),
  name: 'TV',
  description: '',
  price: 35,
  quantity: 3,
  stock_status: StockStatusType.LOW_STOCK,
  status: StatusType.ACTIVE,
  image: '',
  org: orgMock,
  created_at: new Date(),
  updated_at: new Date(),
};
