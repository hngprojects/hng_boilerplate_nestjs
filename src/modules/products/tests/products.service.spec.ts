import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from '../products.service';
import { Product } from '../entities/product.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  describe('Delete Product', () => {
    it('should delete a product successfully', async () => {
      const productId = 'some-product-id';
      jest.spyOn(productRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      const result = await service.removeProduct(productId);

      expect(result).toEqual({
        message: 'Product deleted successfully.',
        status_code: 200,
      });
      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should throw NotFoundException if the product does not exist', async () => {
      const productId = 'non-existing-product-id';
      jest.spyOn(productRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      await expect(service.removeProduct(productId)).rejects.toThrow(NotFoundException);
      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});
