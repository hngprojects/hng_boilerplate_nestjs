import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

  async createNotificationSettings(notificationSettingsDto: NotificationSettingsDto, user_id: string): Promise<any> {
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
      this.logger.error('Error creating notification settings:', error);
      throw new BadRequestException(error.message || 'Failed to create notification settings');
    }
  }

  async findNotificationSettingsByUserId(user_id: string): Promise<NotificationSettings> {
    try {
      const defaultNotificationSettings = {
        email_notification_activity_in_workspace: true,
        email_notification_always_send_email_notifications: false,
        email_notification_email_digest: true,
        email_notification_announcement_and_update_emails: true,
        slack_notifications_activity_on_your_workspace: false,
        slack_notifications_always_send_email_notifications: true,
        slack_notifications_announcement_and_update_emails: false,
      };

      let settings = await this.notificationSettingsRepository.findOne({ where: { user_id } });
      if (!settings) {
        settings = await this.createNotificationSettings(defaultNotificationSettings, user_id);
      }

      return settings;
    } catch (error) {
      this.logger.error('Error finding notification settings by user ID:', error);

      if (error instanceof BadRequestException) {
        throw new BadRequestException(error?.message || 'Failed to fetch notification settings');
      }
      throw new InternalServerErrorException('An unexpected error occurred while fetching notification settings');
    }
  }
  async updateNotificationSettings(
    user_id: string,
    notificationSettingsDto: Partial<NotificationSettingsDto>
  ): Promise<Partial<NotificationSettingsDto>> {
    try {
      const settings = await this.notificationSettingsRepository.findOne({ where: { user_id } });
      if (!settings) {
        throw new NotFoundException('User settings not found');
      }
      Object.assign(settings, notificationSettingsDto);
      await this.notificationSettingsRepository.save(settings);
      return { ...notificationSettingsDto };
    } catch (error) {
      this.logger.error('Error updating notification settings:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.message.includes('validation') || error.name === 'ValidationError') {
        throw new BadRequestException('Invalid data in the request body');
      }
      throw new InternalServerErrorException('An unexpected error occurred while updating notification settings');
    }
  }
}
