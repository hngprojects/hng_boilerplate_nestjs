import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { NotificationSettingsService } from '../../settings/notification-settings/notification-settings.service';
import UserService from '../../user/user.service';
import { Notification } from '../entities/notification.entity';
import { NotificationsService } from '../notifications.service';

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
  findByUserId: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;
  let repository: Repository<Notification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepository },
        { provide: EmailService, useValue: mockEmailService },
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationSettingsService, useValue: mockNotificationSettingsService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      mockNotificationSettingsService.findByUserId.mockResolvedValue({
        email_notification_always_send_email_notifications: true,
      });
      mockRepository.save.mockResolvedValue({ ...notification_content, id: '12345', user: { id: user_id } });

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
      mockRepository.save.mockImplementation(() => {
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
