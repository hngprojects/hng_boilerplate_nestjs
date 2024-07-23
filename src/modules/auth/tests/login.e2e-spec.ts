import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../../app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockUserRepository;
  let mockJwtService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  beforeAll(async () => {
    mockUserRepository = {
      findOneBy: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('fake-jwt-token'),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/login (POST) - success', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body.access_token).toEqual('fake-jwt-token');
    expect(response.body.refresh_token).toEqual('fake-jwt-token');
    expect(response.body.data).toBeDefined();
  });

  it('/api/v1/auth/login (POST) - invalid email/password', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'invalid@example.com', password: 'password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });

  it('/api/v1/auth/login (POST) - invalid password', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });
});
