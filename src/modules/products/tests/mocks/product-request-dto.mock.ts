import { CreateProductRequestDto } from '../../dto/create-product.dto';
import { productMock } from './product.mock';

export const createProductRequestDtoMock: CreateProductRequestDto = {
  name: productMock.name,
  price: productMock.price,
  quantity: productMock.quantity,
  category: '',
};
