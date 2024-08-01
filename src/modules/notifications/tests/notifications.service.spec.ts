import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from '../entities/notifications.entity';
import { NotificationSettings } from '../../notification-settings/entities/notification-setting.entity';
import { mockUser, mockNotificationRepository } from './mocks/notification-repo.mock';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../../../modules/user/entities/user.entity';
import { NotificationSettingsDto } from 'src/modules/notification-settings/dto/notification-settings.dto';
import { NotificationSettingsService } from '../../../modules/notification-settings/notification-settings.service';
import { EmailService } from '../../../modules/email/email.service';
import UserService from '../../../modules/user/user.service';

const mockRepository = {
  save: jest.fn(),
};

const mockEmailService = {
  sendNotificationMail: jest.fn(),
};

const mockUserService = {
  getUserRecord: jest.fn(),
};

const mockNotificationSettingsService = {
  findNotificationSettingsByUserId: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;
  let NotificationSettingsRepository: Repository<NotificationSettings>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepository },
        { provide: EmailService, useValue: mockEmailService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationSettingsService, useValue: mockNotificationSettingsService },
        { provide: getRepositoryToken(User), useValue: mockUser },
        {
          provide: getRepositoryToken(NotificationSettings),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
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

  describe('createNotification', () => {
    const user_id = '123';
    const notification_content = {
      message: 'New Notification',
      is_read: false,
      created_at: '2021-09-01T00:00:00.000Z',
    };

    it('should create a notification successfully', async () => {
      mockUserService.getUserRecord.mockResolvedValue({
        id: user_id,
        email: 'user@example.com',
        first_name: 'John',
        last_name: 'Doe',
      });
      mockNotificationSettingsService.findNotificationSettingsByUserId.mockResolvedValue({
        email_notification_always_send_email_notifications: true,
      });
      mockNotificationRepository.save.mockResolvedValue({
        ...notification_content,
        id: '12345',
        user: { id: user_id },
      });

      await expect(service.createNotification(user_id, notification_content)).resolves.toMatchObject({
        status: 'success',
        message: 'Notification created successfully',
      });

      expect(mockEmailService.sendNotificationMail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user not found', async () => {
      mockUserService.getUserRecord.mockResolvedValue(null);
      await expect(service.createNotification(user_id, notification_content)).rejects.toThrow(BadRequestException);
    });

    it('should handle internal server errors', async () => {
      mockUserService.getUserRecord.mockResolvedValue({ id: user_id });
      mockNotificationRepository.save.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.createNotification(user_id, notification_content)).rejects.toThrow(
        InternalServerErrorException
      );
    });

    it('should throw NotFoundException with specific user_id not found', async () => {
      mockUserService.getUserRecord.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.createNotification(user_id, notification_content)).rejects.toThrow(NotFoundException);
    });
  });
});
