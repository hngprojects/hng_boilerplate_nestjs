import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '../entities/notifications.entity';
import { mockUser, mockNotificationRepository } from './mocks/notification-repo.mock';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
          useValue: mockNotificationRepository,
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

    it('should throw a BadRequest exception if notification_id or options are invalid', async () => {
      await expect(service.markNotificationAsRead(null, null, userId)).rejects.toThrow(
        new BadRequestException({
          status: 'error',
          message: 'Invalid Request',
          status_code: HttpStatus.BAD_REQUEST,
        })
      );
    });

    it('should throw a NotFound exception if notification does not exist', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markNotificationAsRead({ is_read: true }, 'invalid-id', userId)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          message: 'Notification not found',
          status_code: HttpStatus.NOT_FOUND,
        })
      );
    });

    it('should mark notification as read if it exists and belongs to the user', async () => {
      const notification: Notification = {
        id: 'valid-id',
        is_read: false,
        message: 'valid notification',
        user: { id: userId } as User,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const options = { is_read: true };
      mockNotificationRepository.findOne.mockResolvedValue(notification);
      mockNotificationRepository.save.mockResolvedValue({ ...notification, is_read: true });

      const result = await service.markNotificationAsRead(options, 'valid-id', userId);

      expect(result).toEqual({
        status: 'success',
        message: 'Notification marked as read successfully',
        status_code: HttpStatus.OK,
        data: {
          notification_id: notification.id,
          message: notification.message,
          is_read: true,
          updated_at: notification.updated_at,
        },
      });

      expect(mockNotificationRepository.save).toHaveBeenCalledWith({ ...notification, is_read: true });
    });
  });

  describe('markAllUnreadNotificationsAsRead', () => {
    const userId = 'user-id';

    it('should return success message if no unread notifications are found for the user', async () => {
      mockNotificationRepository.find.mockResolvedValue([]);

      const result = await service.markAllNotificationsAsReadForUser(userId);

      expect(result).toEqual({
        status: 'success',
        status_code: HttpStatus.OK,
        message: 'Notifications cleared successfully.',
        data: {
          notifications: [],
        },
      });
    });

    it('should mark all unread notifications as read for the user if they exist', async () => {
      const notifications = [
        { id: 'notif1', is_read: false, user: { id: userId } },
        { id: 'notif2', is_read: false, user: { id: userId } },
      ];
      mockNotificationRepository.find.mockResolvedValue(notifications);
      mockNotificationRepository.save.mockResolvedValue(
        notifications.map(notification => ({ ...notification, is_read: true }))
      );

      const result = await service.markAllNotificationsAsReadForUser(userId);

      expect(result).toEqual({
        status: 'success',
        status_code: HttpStatus.OK,
        message: 'Notifications cleared successfully.',
        data: {
          notifications: [],
        },
      });

      expect(mockNotificationRepository.save).toHaveBeenCalledWith(
        notifications.map(notification => ({ ...notification, is_read: true }))
      );
    });
    it('should handle server error when clearing notifications', async () => {
      mockNotificationRepository.find.mockRejectedValue(new Error('Server Error'));

      await expect(service.markAllNotificationsAsReadForUser(userId)).rejects.toThrowError(
        new InternalServerErrorException()
      );
    });
  });
});
