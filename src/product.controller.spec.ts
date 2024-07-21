// src/products/products.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { ProductService } from './service/products.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let productService = {
    remove: jest.fn().mockImplementation((id: number) => {
      if (id === 1) {
        return Promise.resolve();
      } else {
        throw new Error('Product not found');
      }
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ProductService)
      .useValue(productService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/DELETE /api/v1/products/:id', () => {
    it('should delete a product successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/1')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.message).toBe('Product deleted successfully.');
    });

    it('should return 404 if the product does not exist', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/products/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);

      expect(response.body.error).toBe('Product not found');
      expect(response.body.message).toBe('The product with ID 999 does not exist.');
    });

    it('should return 401 if the user is not authenticated', async () => {
      await request(app.getHttpServer()).delete('/api/v1/products/1').expect(401);
    });
  });
});
