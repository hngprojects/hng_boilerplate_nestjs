import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from 'src/controllers/auth.controller';
import { AuthService } from 'src/services/auth.service';
import { AuthModule } from 'src/modules/auth.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { runInTransaction, initialiseTestTransactions } from 'typeorm-test-transactions';

initialiseTestTransactions();

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  let userRepo: Repository<User>;
  let jwtService: JwtService;
  let authService: AuthService;

  const mockUser = {
    id: '80ead1f5-6cb4-451d-9b35-de4710d14e74',
    first_name: 'John',
    last_name: 'Smith',
    email: 'john.smith@example.com',
    is_active: null,
    attempts_left: null,
    time_left: null,
    created_at: '2024-07-21T07:16:01.186Z',
    updated_at: '2024-07-21T07:16:01.622Z',
  };

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, { provide: getRepositoryToken(User), useValue: mockAuthService }],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    // userRepo = moduleFixture.get<User>(getRepositoryToken(User));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    await app.init();
  });

  describe('login', () => {
    it('should login a registered user', async () => {
      jest.spyOn(authService, 'login').mockRejectedValue(mockUser);
      return request(app.getHttpServer()).post('/api/v1/auth/login').expect(200).expect(mockUser);
    });
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
  });
});
