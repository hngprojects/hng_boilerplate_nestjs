import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { NotificationSettings } from '../notification-settings/entities/notification-setting.entity';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';
import { Profile } from '../profile/entities/profile.entity';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import { Notification } from './entities/notifications.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailTemplate } from '../email/entities/email-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Profile, NotificationSettings, EmailTemplate])],
  controllers: [NotificationsController],
  providers: [NotificationsService, Repository, UserService, NotificationSettingsService, EmailService],
})
export class NotificationsModule {}
