import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotificationSettingsDto } from './dto/notification-settings.dto';

@Injectable()
export class NotificationSettingsService {
  private readonly logger = new Logger(NotificationSettingsService.name);

  constructor(
    @InjectRepository(NotificationSettings)
    private notificationSettingsRepository: Repository<NotificationSettings>
  ) {}

  async create(notificationSettingsDto: any, user_id: string): Promise<any> {
    try {
      const existingSettings = await this.notificationSettingsRepository.findOne({
        where: { user_id },
      });

      if (existingSettings) {
        Object.assign(existingSettings, notificationSettingsDto);
        return this.notificationSettingsRepository.save(existingSettings);
      }

      const newSettings = this.notificationSettingsRepository.create({ ...notificationSettingsDto, user_id });
      return this.notificationSettingsRepository.save(newSettings);
    } catch (error) {
      throw new BadRequestException(error.message || 'Failed to create notification settings');
    }
  }

  async findByUserId(user_id: string): Promise<NotificationSettings> {
    try {
      const settings = await this.notificationSettingsRepository.findOne({ where: { user_id } });
      if (!settings) {
        throw new NotFoundException('Notification settings not found');
      }

      return settings;
    } catch (error) {
      this.logger.error('Error finding notification settings by user ID:', error);
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException if it was the original error
      }
      throw new BadRequestException(error?.message || 'Failed to fetch notification settings');
    }
  }
}
