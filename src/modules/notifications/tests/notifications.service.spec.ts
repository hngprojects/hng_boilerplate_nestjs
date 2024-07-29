import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should create notification', () => {
    const createNotificationDto = {
      message: 'Hello World',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const notificationsPreference = {
      email_notifications: true,
      push_notifications: true,
    };
    const user = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
    };

    expect(service.createNotification(createNotificationDto, notificationsPreference, user)).toEqual({
      status_code: 200,
      message: 'Notification created successfully',
      data: {
        notifications: [
          {
            id: expect.any(String),
            user_id: expect.any(String),
            message: 'Hello World',
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ],
      },
    });
  });

  it('should throw an error if user is not authorized', () => {
    const createNotificationDto = {
      message: 'Hello World',
      is_read: false,
      created_at: new Date().toISOString(),
    };
    const notificationsPreference = {
      email_notifications: true,
      push_notifications: true,
    };
    const user = null;

    expect(() => service.createNotification(createNotificationDto, notificationsPreference, user)).toThrow(
      new UnauthorizedException({
        message: 'User is currently unauthorized, kindly authenticate to continue',
        status_code: 401,
      })
    );
  });

  it('should throw an error if input is wrong');
});
