import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateHelpCenterDto } from './create-help-center.dto';
import { AppModule } from '../../app.module';
import { HelpCenterService } from './help-center.service';

describe('HelpCenterController', () => {
  let app: INestApplication;
  let helpCenterService: HelpCenterService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HelpCenterService)
      .useValue({
        createHelpCenter: jest.fn().mockImplementation((dto, author) => {
          return {
            id: '123',
            ...dto,
            author: 'Admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }),
      })
      .compile();

    app = module.createNestApplication();
    helpCenterService = module.get<HelpCenterService>(HelpCenterService);
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

      expect(helpCenterService.createHelpCenter).toHaveBeenCalledWith(createHelpCenterDto, 'Admin');

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
});
