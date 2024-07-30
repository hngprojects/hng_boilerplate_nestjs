import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from '../notifications.controller';
import { NotificationsService } from '../notifications.service';
import { NotFoundException } from '@nestjs/common';

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
            getUnreadNotificationsForUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('getUnreadNotifications', () => {
    it('should return unread notifications for the user', async () => {
      const req = { user: { id: '1' } };
      const isRead = 'false';
      const notifications = { notifications: [], totalNotificationCount: 0, totalUnreadNotificationCount: 0 };

      jest.spyOn(service, 'getUnreadNotificationsForUser').mockResolvedValue(notifications);

      const result = await controller.getUnreadNotifications(req, isRead);

      expect(result).toEqual({
        status: 'success',
        message: 'Unread notifications retrieved successfully',
        status_code: 200,
        data: notifications,
      });
    });

    it('should return an error if is_read query param is not false', async () => {
      const req = { user: { id: '1' } };
      const isRead = 'true';

      const result = await controller.getUnreadNotifications(req, isRead);

      expect(result).toEqual({
        status: 'error',
        message: 'Invalid request',
        status_code: 400,
      });
    });

    it('should handle NotFoundException', async () => {
      const req = { user: { id: '1' } };
      const isRead = 'false';

      jest.spyOn(service, 'getUnreadNotificationsForUser').mockRejectedValue(new NotFoundException('User not found'));

      const result = await controller.getUnreadNotifications(req, isRead);

      expect(result).toEqual({
        status: 'error',
        message: 'User not found',
        status_code: 400,
      });
    });

    it('should handle other exceptions', async () => {
      const req = { user: { id: '1' } };
      const isRead = 'false';

      jest.spyOn(service, 'getUnreadNotificationsForUser').mockRejectedValue(new Error('Failed to retrieve'));

      const result = await controller.getUnreadNotifications(req, isRead);

      expect(result).toEqual({
        status: 'error',
        message: 'Failed to retrieve unread notifications',
        status_code: 500,
      });
    });
  });
});
