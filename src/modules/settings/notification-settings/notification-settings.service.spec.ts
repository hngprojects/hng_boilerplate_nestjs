import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('NotificationSettingsService', () => {
  let service: NotificationSettingsService;
  let repository: Repository<NotificationSettings>;

  const mockNotificationSettingsRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingsService,
        {
          provide: getRepositoryToken(NotificationSettings),
          useValue: mockNotificationSettingsRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationSettingsService>(NotificationSettingsService);
    repository = module.get<Repository<NotificationSettings>>(getRepositoryToken(NotificationSettings));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create new notification settings if not existing', async () => {
      const dto: NotificationSettingsDto = {
        settingName: '',
        settingValue: '',
        email_notifications: false,
        push_notifications: false,
        sms_notifications: false,
      };
      const userId = 'some-user-id';

      mockNotificationSettingsRepository.findOne.mockResolvedValue(null);
      mockNotificationSettingsRepository.create.mockReturnValue(dto);
      mockNotificationSettingsRepository.save.mockResolvedValue(dto);

      const result = await service.create(dto, userId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id: userId } });
      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(repository.save).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('should update existing notification settings', async () => {
      const dto: NotificationSettingsDto = {
        settingName: '',
        settingValue: '',
        email_notifications: false,
        push_notifications: false,
        sms_notifications: false,
      };
      const existingSettings = { id: 1, ...dto };
      const userId = 'some-user-id';

      mockNotificationSettingsRepository.findOne.mockResolvedValue(existingSettings);
      mockNotificationSettingsRepository.save.mockResolvedValue(existingSettings);

      const result = await service.create(dto, userId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id: userId } });
      expect(repository.save).toHaveBeenCalledWith(existingSettings);
      expect(result).toEqual(existingSettings);
    });

    it('should throw BadRequestException on error', async () => {
      const dto: NotificationSettingsDto = {
        settingName: '',
        settingValue: '',
        email_notifications: false,
        push_notifications: false,
        sms_notifications: false,
      };
      const userId = 'some-user-id';

      mockNotificationSettingsRepository.findOne.mockRejectedValue(new Error('Some error'));

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUserId', () => {
    it('should return notification settings for given user ID', async () => {
      const userId = 'some-user-id';
      const settings = { id: 1, user_id: userId /* other properties */ };

      mockNotificationSettingsRepository.findOne.mockResolvedValue(settings);

      const result = await service.findByUserId(userId);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id: userId } });
      expect(result).toEqual(settings);
    });

    it('should throw NotFoundException if settings not found', async () => {
      const userId = 'some-user-id';

      mockNotificationSettingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId(userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      const userId = 'some-user-id';

      mockNotificationSettingsRepository.findOne.mockRejectedValue(new Error('Some error'));

      await expect(service.findByUserId(userId)).rejects.toThrow(BadRequestException);
    });
  });
});
