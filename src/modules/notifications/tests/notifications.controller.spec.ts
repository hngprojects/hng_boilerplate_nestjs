import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import { UserPayload } from '../../user/interfaces/user-payload.interface';
import { InternalServerErrorException } from '@nestjs/common';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            getNotificationsForUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should return notifications for a valid user', async () => {
      const req = { user: { id: 'valid-user-id' } } as { user: UserPayload };
      const notificationsData = {
        totalNotificationCount: 2,
        totalUnreadNotificationCount: 1,
        notifications: [],
      };

      jest.spyOn(service, 'getNotificationsForUser').mockResolvedValue(notificationsData);

      const result = await controller.getNotifications(req);

      expect(result.status_code).toBe(200);
      expect(result.message).toBe('Notifications retrieved successfully.');
      expect(result.data).toEqual(notificationsData);
    });

    it('should return an error if notifications retrieval fails', async () => {
      const req = { user: { id: 'valid-user-id' } } as { user: UserPayload };

      jest
        .spyOn(service, 'getNotificationsForUser')
        .mockRejectedValue(new InternalServerErrorException('Failed to retrieve notifications.'));

      const result = await controller.getNotifications(req);

      expect(result.status_code).toBe(500);
      expect(result.message).toBe('Failed to retrieve notifications.');
      expect(result.data).toBeNull();
    });
  });
});
