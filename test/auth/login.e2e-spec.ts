import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('fake-jwt-token'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideProvider(JwtService)
      .useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/auth/login (POST) - success', async () => {
    const user = { id: '1', email: 'test@example.com', password: 'hashedPassword' } as User;
    mockUserRepository.findOneBy.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(200);

    expect(response.body).toEqual({ token: 'fake-jwt-token' });
  });

  it('api/v1/auth/login (POST) - invalid email/password', async () => {
    mockUserRepository.findOneBy.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid@example.com', password: 'password' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });

  it('/auth/login (POST) - invalid password', async () => {
    const user = { id: '1', email: 'test@example.com', password: 'hashedPassword' } as User;
    mockUserRepository.findOneBy.mockResolvedValue(user);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

    const response = await request(app.getHttpServer())
      .post('auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);

    expect(response.body.message).toBe('Invalid email or Password');
  });
});
