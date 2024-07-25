import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { NotFoundException } from '@nestjs/common';

describe('NotificationSettingsService', () => {
  let service: NotificationSettingsService;
  let repo: Repository<NotificationSettings>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingsService,
        {
          provide: getRepositoryToken(NotificationSettings),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationSettingsService>(NotificationSettingsService);
    repo = module.get<Repository<NotificationSettings>>(getRepositoryToken(NotificationSettings));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdate', () => {
    it('should create new settings if they do not exist', async () => {
      const dto: NotificationSettingsDto = {
        user_id: 'test@example.com',
        email_notifications: true,
        push_notifications: false,
        sms_notifications: true,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);
      jest.spyOn(repo, 'create').mockReturnValue(dto as NotificationSettings);
      jest.spyOn(repo, 'save').mockResolvedValue(dto as NotificationSettings);

      const result = await service.createOrUpdate(dto);
      expect(result).toEqual(dto);
    });

    it('should update existing settings', async () => {
      const dto: NotificationSettingsDto = {
        user_id: 'test@example.com',
        email_notifications: true,
        push_notifications: false,
        sms_notifications: true,
      };
      const existingSettings = { ...dto, id: '1' };
      jest.spyOn(repo, 'findOne').mockResolvedValue(existingSettings as NotificationSettings);
      jest.spyOn(repo, 'save').mockResolvedValue(existingSettings as NotificationSettings);

      const result = await service.createOrUpdate(dto);
      expect(result).toEqual(existingSettings);
    });
  });

  describe('findByUserId', () => {
    it('should return settings if they exist', async () => {
      const settings = {
        id: '1',
        user_id: 'test@example.com',
        email_notifications: true,
        push_notifications: false,
        sms_notifications: true,
      };
      jest.spyOn(repo, 'findOne').mockResolvedValue(settings as NotificationSettings);

      const result = await service.findByUserId('test@example.com');
      expect(result).toEqual(settings);
    });

    it('should throw NotFoundException if settings do not exist', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(null);

      await expect(service.findByUserId('test@example.com')).rejects.toThrow(NotFoundException);
    });
  });
});
