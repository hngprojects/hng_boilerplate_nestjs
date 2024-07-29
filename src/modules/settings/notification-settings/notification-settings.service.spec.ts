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

  const dto: NotificationSettingsDto = {
    email_notifications: false,
    push_notifications: false,
  };

  const user_id = 'some-user-id';

  const existingSettings = { ...dto, id: 1, user_id };

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
      const notification = { ...dto, user_id };

      mockNotificationSettingsRepository.findOne.mockResolvedValue(null);
      mockNotificationSettingsRepository.create.mockReturnValue(notification);
      mockNotificationSettingsRepository.save.mockResolvedValue(notification);

      const result = await service.create(dto, user_id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id: user_id } });
      expect(repository.create).toHaveBeenCalledWith(notification);
      expect(repository.save).toHaveBeenCalledWith(notification);
      expect(result).toEqual(notification);
    });

    it('should update existing notification settings', async () => {
      mockNotificationSettingsRepository.findOne.mockResolvedValue(existingSettings);
      mockNotificationSettingsRepository.save.mockResolvedValue(existingSettings);

      const result = await service.create(dto, user_id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id: user_id } });
      expect(repository.save).toHaveBeenCalledWith(existingSettings);
      expect(result).toEqual(existingSettings);
    });

    it('should throw BadRequestException on error', async () => {
      mockNotificationSettingsRepository.findOne.mockRejectedValue(new Error('Some error'));

      await expect(service.create(dto, user_id)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByUserId', () => {
    it('should return notification settings for given user ID', async () => {
      const settings = { id: 1, user_id /* other properties */ };

      mockNotificationSettingsRepository.findOne.mockResolvedValue(settings);

      const result = await service.findByUserId(user_id);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id } });
      expect(result).toEqual(settings);
    });

    it('should throw NotFoundException if settings not found', async () => {
      mockNotificationSettingsRepository.findOne.mockResolvedValue(null);

      await expect(service.findByUserId(user_id)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException on error', async () => {
      mockNotificationSettingsRepository.findOne.mockRejectedValue(new Error('Some error'));

      await expect(service.findByUserId(user_id)).rejects.toThrow(BadRequestException);
    });
  });
});
