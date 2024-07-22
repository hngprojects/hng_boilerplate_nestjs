// src/customers/customers.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let customersService = { findOne: (id: string) => ({ id, name: 'John Doe' }) };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CustomersService)
      .useValue(customersService)
      .compile();
  });
});

describe('CustomersController (e2e)', () => {
  let app: INestApplication;
  let customersService = { findOne: (id: string) => ({ id, name: 'John Doe' }) };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CustomersService)
      .useValue(customersService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/customers/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/customers/12345')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect({
        status_code: 200,
        data: {
          id: '12345',
          name: 'John Doe',
        },
      });
  });

  it('/api/v1/customers/:id (GET) - 404 Not Found', () => {
    customersService.findOne = () => null;
    return request(app.getHttpServer())
      .get('/api/v1/customers/67890')
      .set('Authorization', 'Bearer valid-token')
      .expect(404)
      .expect({
        status_code: 404,
        message: 'Customer not found',
        error: 'Not Found',
      });
  });

  it('/api/v1/customers/:id (GET) - 401 Unauthorized', () => {
    return request(app.getHttpServer()).get('/api/v1/customers/12345').expect(401).expect({
      status_code: 401,
      message: 'Authentication required',
      error: 'Unauthorized',
    });
  });

  it('/api/v1/customers/:id (GET) - 403 Forbidden', () => {
    customersService.findOne = () => {
      throw new ForbiddenException();
    };
    return request(app.getHttpServer())
      .get('/api/v1/customers/12345')
      .set('Authorization', 'Bearer valid-token')
      .expect(403)
      .expect({
        status_code: 403,
        message: "You do not have permission to access this customer's details",
        error: 'Forbidden',
      });
  });
});
