import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { User } from '../../src/entities/user.entity';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - success', async () => {
    const user = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
    mockUserRepository.findOneBy.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body).toEqual({ token: 'fake-jwt-token' });
  });

  it('/auth/login (POST) - invalid email', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'invalid@example.com', password: 'password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });

  it('/auth/login (POST) - invalid password', async () => {
    const user = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
    mockUserRepository.findOneBy.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });
});
