import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ContactController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/contact (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/contact')
      .send({
        name: 'Nicholas Duadei',
        email: 'nicholasduadei14',
        message: 'This is a test',
      })
      .expect(200)
      .then(response => {
        expect(response.body).toEqual({
          message: 'Inquiry was successfully sent',
          status: 200,
        });
      });
  });
});
