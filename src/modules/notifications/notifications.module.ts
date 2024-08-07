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
import { OrganisationRole } from '../organisation-role/entities/organisation-role.entity';
import { DefaultPermissions } from '../organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../organisation-permissions/entities/permissions.entity';
import { DefaultRole } from '../organisation-role/entities/role.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationsService } from '../organisations/organisations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      User,
      Profile,
      NotificationSettings,
      Organisation,
      OrganisationMember,
      OrganisationRole,
      DefaultRole,
      DefaultPermissions,
      Permissions,
    ]),
    EmailModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    Repository,
    UserService,
    NotificationSettingsService,
    OrganisationsService,
    EmailService,
  ],
})
export class NotificationsModule {}
