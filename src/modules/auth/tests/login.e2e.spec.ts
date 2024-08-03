import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { AppModule } from '../../../app.module';
import UserService from '../../../modules/user/user.service';

jest.mock('../../../modules/user/user.service');

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockUser: { email: string; password: string };

  beforeAll(async () => {
    const password = await bcrypt.hash('testPassword1!', 10);
    mockUser = {
      password,
      email: 'test@email.com',
    };
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jest.spyOn(UserService.prototype, 'getUserRecord').mockResolvedValue(mockUser);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Logs in a user if credentials are correct', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@email.com', password: 'testPassword1!' })
      .expect(200);

    expect(response.body.data.user.email).toEqual(mockUser.email);
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.access_token).toBeDefined();
  });

  it('Returns appropriate error response if password is incorrect', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@email.com', password: 'wrongPassword1!' })
      .expect(401);
    expect(response.body.message).toEqual('Invalid email or password');
    expect(response.body.access_token).toBeUndefined();
  });
});
