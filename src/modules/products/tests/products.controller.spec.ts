import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../products.controller';
import { ProductsService } from '../products.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockAuthGuard = {
      canActivate: jest.fn(() => true),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            remove: jest.fn().mockImplementation((id: string) => {
              if (id === 'existing-id') {
                return Promise.resolve({ message: 'Product deleted successfully.' });
              } else if (id === 'non-existing-id') {
                throw new HttpException('Product with specified ID does not exist.', HttpStatus.NOT_FOUND);
              }
            }),
          },
        },
        { provide: JwtService, useValue: mockJwtService },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('remove', () => {
    it('should delete a product and return a success message', async () => {
      const result = await controller.remove('existing-id');
      expect(result).toEqual({ message: 'Product deleted successfully.' });
      expect(service.remove).toHaveBeenCalledWith('existing-id');
    });

    it('should throw an error if product does not exist', async () => {
      try {
        await controller.remove('non-existing-id');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
        expect(error.response).toBe('Product with specified ID does not exist.');
      }
      expect(service.remove).toHaveBeenCalledWith('non-existing-id');
    });
  });
});
