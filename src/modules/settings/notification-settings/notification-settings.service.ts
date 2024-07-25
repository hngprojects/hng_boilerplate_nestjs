import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotificationSettingsDto } from './dto/notification-settings.dto';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSettings)
    private notificationSettingsRepository: Repository<NotificationSettings>
  ) {}

  async create(notificationSettingsDto: NotificationSettingsDto, userId: string): Promise<NotificationSettings> {
    const existingSettings = await this.notificationSettingsRepository.findOne({
      where: { user_id: userId },
    });

    if (existingSettings) {
      Object.assign(existingSettings, notificationSettingsDto);
      return this.notificationSettingsRepository.save(existingSettings);
    }

    const newSettings = this.notificationSettingsRepository.create(notificationSettingsDto);
    return this.notificationSettingsRepository.save(newSettings);
  }

  async findByUserId(user_id: string): Promise<NotificationSettings> {
    const settings = await this.notificationSettingsRepository.findOne({ where: { user_id } });
    if (!settings) {
      throw new NotFoundException('Notification settings not found');
    }
    return settings;
  }
}
