import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/services/auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: Repository<User>;

  const USER_REPOSITORY_TOKEN = getRepositoryToken(User);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: getRepositoryToken(User), useValue: { login: jest.fn() } }],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    userRepository = moduleFixture.get<Repository<User>>(USER_REPOSITORY_TOKEN);
    await app.init();
  });

  it('should login a registered user [POST /api/v1/auth/login]', async () => {
    const response = request(app.getHttpServer());
    await authService.login({ email: 'john.smith@example.com', password: 'password' });

    expect(authService.login).toHaveBeenCalledWith({ email: 'john.smith@example.com', password: 'password' });
  });
});
