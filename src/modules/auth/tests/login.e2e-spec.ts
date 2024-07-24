import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../../app.module';
import { User } from '../../user/entities/user.entity';

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

  it('should login user and return appropriate response if correct credentials', async () => {
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

  it('should return an error if invalid email', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'invalid@example.com', password: 'password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });

  it('should return an error if invalid password', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });
});
