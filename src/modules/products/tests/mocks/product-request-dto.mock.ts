import { CreateProductRequestDto } from '../../dto/create-product.dto';
import { productMock } from './product.mock';

export const createProductRequestDtoMock: CreateProductRequestDto = {
  name: productMock.name,
  price: productMock.variants[0].price,
  quantity: productMock.variants[0].quantity,
  category: '',
};
