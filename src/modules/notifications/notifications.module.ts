import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailModule } from '../email/email.module';
import { EmailService } from '../email/email.service';
import { NotificationSettings } from '../notification-settings/entities/notification-setting.entity';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';
import { Profile } from '../profile/entities/profile.entity';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import { Notification } from './entities/notifications.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User, Profile, NotificationSettings]), EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, Repository, UserService, NotificationSettingsService, EmailService, Logger],
})
export class NotificationsModule {}
