import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Auth2FAService } from '../src/modules/auth2fa/auth2fa.service';
import { User } from '../src/entities/user.entity';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('Auth2FAController (e2e)', () => {
  let app: INestApplication;
  let auth2FAService: Auth2FAService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: '1cbf47f6-8b3f-4031-af42-428f3f49de0d',
    first_name: 'John',
    email: 'john@example.com',
    password: '$2b$10$ETxLWrxqm7BOuKfI.n/2o.R8lRrzbaV6H4/CKSKe1Eol95mYXtNnW',
    secret: null,
    is_2fa_enabled: false,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn().mockResolvedValue(mockUser),
        save: jest.fn().mockResolvedValue(mockUser),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    auth2FAService = moduleFixture.get<Auth2FAService>(Auth2FAService);
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  it('/auth/2fa/enable/:id (POST) - success', async () => {
    const response = await request(app.getHttpServer())
      .post(`/auth/2fa/enable/${mockUser.id}`)
      .send({ password: 'password' });
    expect(response.body).toEqual({
      status_code: 200,
      message: '2FA setup initiated',
      data: expect.any(Object),
    });
  });
});
