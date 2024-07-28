import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notifications.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUser, updateNotificationMock } from './mocks/update-notification-to-isRead';
import { BadRequestException, ForbiddenException, HttpStatus, NotFoundException } from '@nestjs/common';
import { User } from '../../../modules/user/entities/user.entity';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: updateNotificationMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('markNotificationAsRead', () => {
    const userId = 'validUserId';

    it('should throw a BadRequest exception if notificationId or options are invalid', async () => {
      await expect(service.markNotificationAsRead(null, null, userId)).rejects.toThrow(
        new BadRequestException({
          status: 'error',
          message: 'Invalid Request',
          status_code: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it('should throw a NotFound exception if notification does not exist', async () => {
      updateNotificationMock.findOne.mockResolvedValue(null);

      await expect(service.markNotificationAsRead({ isRead: true }, 'invalid-id', userId)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          message: 'Notification not found',
          status_code: HttpStatus.NOT_FOUND,
        })
      );
    });

    it('should throw a ForbiddenException if notification does not belong to the user', async () => {
      const differentUser: Partial<User> = { ...mockUser, id: 'different-user' };
      const notification: Notification = {
        id: 'valid-id',
        isRead: false,
        message: 'new Notification',
        user: differentUser as User,
        updated_at: new Date(),
        created_at: new Date(),
      };

      updateNotificationMock.findOne.mockResolvedValue(notification);

      await expect(service.markNotificationAsRead({ isRead: true }, 'valid-id', userId)).rejects.toThrow(
        new ForbiddenException('You do not have permission to access this notification')
      );
    });

    it('should mark notification as read if it exists and belongs to the user', async () => {
      const notification: Notification = {
        id: 'valid-id',
        isRead: false,
        message: 'valid notification',
        user: mockUser as User,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const options = { isRead: true };
      updateNotificationMock.findOne.mockResolvedValue(notification);
      updateNotificationMock.save.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markNotificationAsRead(options, 'valid-id', userId);

      expect(result).toEqual({
        status: 'success',
        message: 'Notification marked as read successfully',
        data: {
          id: notification.id,
          message: notification.message,
          isRead: notification.isRead,
          updatedAt: notification.updated_at,
        },
      });

      expect(updateNotificationMock.save).toHaveBeenCalledWith({ ...notification, isRead: true });
    });
  });
});
