import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { User } from '@modules/user/entities/user.entity';
import { Profile } from '@modules/profile/entities/profile.entity';
import { NotificationSettings } from '@modules/notification-settings/entities/notification-setting.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Role } from '@modules/role/entities/role.entity';
import { EmailService } from '@modules/email/email.service';
import { NotificationSettingsService } from '@modules/notification-settings/notification-settings.service';
import UserService from '@modules/user/user.service';
import { EmailModule } from '@modules/email/email.module';

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
