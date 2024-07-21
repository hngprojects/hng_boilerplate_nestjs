import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('InvitationsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('/api/v1/organisations/send-invite (POST) - missing fields', () => {
    return request(app.getHttpServer())
      .post('/api/v1/organisations/send-invite')
      .set('Authorization', 'Bearer VALID_ADMIN_TOKEN')
      .send({ emails: [] })
      .expect(400)
      .expect(res => {
        expect(res.body.status_code).toBe(400);
        expect(res.body.message).toContain('Missing fields');
      });
  });

  it('/api/v1/organisations/send-invite (POST) - invalid token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/organisations/send-invite')
      .set('Authorization', 'Bearer INVALID_TOKEN')
      .send({ emails: ['test@example.com'] })
      .expect(401)
      .expect(res => {
        expect(res.body.status_code).toBe(401);
        expect(res.body.message).toContain('Unauthorized');
      });
  });

  it('/api/v1/organisations/send-invite (POST) - valid request', () => {
    return request(app.getHttpServer())
      .post('/api/v1/organisations/send-invite')
      .set('Authorization', 'Bearer VALID_ADMIN_TOKEN')
      .send({ emails: ['test@example.com'] })
      .expect(201)
      .expect(res => {
        expect(res.body.status_code).toBe(201);
        expect(res.body.message).toBe('Invitations sent successfully');
      });
  });
});
