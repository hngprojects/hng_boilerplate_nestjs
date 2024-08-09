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
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import QueueService from '../email/queue.service';
import { EmailModule } from '../email/email.module';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      Profile,
      NotificationSettings,
      Organisation,
      OrganisationUserRole,
      Role,
    ]),
    EmailModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, Repository, UserService, NotificationSettingsService, EmailService],
})
export class NotificationsModule {}
