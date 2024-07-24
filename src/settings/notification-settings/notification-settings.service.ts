import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationSetting } from './entities/notification-setting.entity';

@Injectable()
export class NotificationSettingsService {
  constructor(
    @InjectRepository(NotificationSetting)
    private notificationSettingsRepository: Repository<NotificationSetting>
  ) {}

  async createOrUpdate(userId: string, settings: Partial<NotificationSetting>): Promise<NotificationSetting> {
    let notificationSetting = await this.notificationSettingsRepository.findOne({ where: { userId } });

    if (!notificationSetting) {
      notificationSetting = this.notificationSettingsRepository.create({ userId, ...settings });
    } else {
      this.notificationSettingsRepository.merge(notificationSetting, settings);
    }

    return this.notificationSettingsRepository.save(notificationSetting);
  }

  async findByUserId(userId: string): Promise<NotificationSetting> {
    return this.notificationSettingsRepository.findOne({ where: { userId } });
  }
}
