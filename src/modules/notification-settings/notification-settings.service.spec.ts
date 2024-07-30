import { Test, TestingModule } from '@nestjs/testing';
import { NotificationSettingsService } from './notification-settings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('NotificationSettingsService', () => {
  let service: NotificationSettingsService;
  let repository: Repository<NotificationSettings>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingsService,
        {
          provide: getRepositoryToken(NotificationSettings),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationSettingsService>(NotificationSettingsService);
    repository = module.get<Repository<NotificationSettings>>(getRepositoryToken(NotificationSettings));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return new notification settings', async () => {
      const user_id = 'test-user-id';
      const createDto = {
        email_notification_activity_in_workspace: true,
        email_notification_always_send_email_notifications: false,
      };

      const createdSettings = { ...createDto, user_id };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null); // Simulate no existing settings
      jest.spyOn(repository, 'create').mockReturnValue(createdSettings as any);
      jest.spyOn(repository, 'save').mockResolvedValue(createdSettings as any);

      const result = await service.create(createDto, user_id);

      expect(result).toEqual(createdSettings);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id } });
      expect(repository.create).toHaveBeenCalledWith({ ...createDto, user_id });
      expect(repository.save).toHaveBeenCalledWith(createdSettings);
    });

    it('should update and return existing notification settings if they already exist', async () => {
      const user_id = 'test-user-id';
      const existingSettings = {
        user_id,
        email_notification_activity_in_workspace: false,
        email_notification_always_send_email_notifications: false,
      };
      const updateDto = {
        email_notification_activity_in_workspace: true,
      };

      const updatedSettings = {
        ...existingSettings,
        ...updateDto,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingSettings as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedSettings as any);

      const result = await service.create(updateDto, user_id);

      expect(result).toEqual(updatedSettings);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { user_id } });
      expect(repository.save).toHaveBeenCalledWith(updatedSettings);
    });

    it('should throw BadRequestException if an error occurs', async () => {
      const user_id = 'test-user-id';
      const createDto = { email_notification_activity_in_workspace: true };

      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto, user_id)).rejects.toThrow(BadRequestException);
    });
  });
});
