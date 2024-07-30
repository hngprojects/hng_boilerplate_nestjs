import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { CreateHelpCenterDto } from './create-help-center.dto';
import * as request from 'supertest';
import { AppModule } from '../../app.module';

describe('HelpCenterController', () => {
  let app: INestApplication;
  let createdTopicId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /help-center', () => {
    it('should create a help center topic and set the author as "Admin"', async () => {
      const createHelpCenterDto: CreateHelpCenterDto = {
        title: 'Test Topic',
        content: 'This is a test content.',
      };

      const response = await request(app.getHttpServer()).post('/help-center').send(createHelpCenterDto).expect(201);

      createdTopicId = response.body.data.id;

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          ...createHelpCenterDto,
          author: 'Admin',
          id: expect.any(String),
          created_at: expect.any(String),
          updated_at: expect.any(String),
        }),
        status_code: 201,
      });
    });
  });

  describe('GET /help-center', () => {
    it('should fetch all help center topics', async () => {
      const response = await request(app.getHttpServer()).get('/help-center').expect(200);

      expect(response.body).toEqual({
        status_code: 200,
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            content: expect.any(String),
            author: expect.any(String),
            id: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String),
          }),
        ]),
      });
    });
  });
});
