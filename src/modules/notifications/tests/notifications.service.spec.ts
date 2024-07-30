import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notifications.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockUser, mockNotificationRepository } from './mocks/notification-repo.mock';
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
        isRead: false,
        message: 'valid notification',
        user: mockUser as User,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const options = { is_read: true };
      mockNotificationRepository.findOne.mockResolvedValue(notification);
      mockNotificationRepository.save.mockResolvedValue({ ...notification, isRead: true });

      const result = await service.markNotificationAsRead(options, 'valid-id', userId);

      expect(result).toEqual({
        status: 'success',
        message: 'Notification marked as read successfully',
        status_code: HttpStatus.OK,
        data: {
          notification_id: notification.id,
          message: notification.message,
          is_read: notification.isRead,
          updated_at: notification.updated_at,
        },
      });

      expect(mockNotificationRepository.save).toHaveBeenCalledWith({ ...notification, isRead: true });
    });
  });
});
