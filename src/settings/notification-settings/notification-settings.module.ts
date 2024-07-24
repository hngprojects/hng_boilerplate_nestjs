import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettingsController } from './notification-settings.controller';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSetting } from './entities/notification-setting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSetting])],
  controllers: [NotificationSettingsController],
  providers: [NotificationSettingsService],
})
export class NotificationSettingsModule {}
