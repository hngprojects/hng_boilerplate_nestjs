import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSetting } from './entities/notification-setting.entity';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';

@Controller('settings/notification-settings')
@UseGuards(JwtAuthGuard)
export class NotificationSettingsController {
  constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

  @Post()
  async createOrUpdate(@Body() body: { user_id: string } & Partial<NotificationSetting>) {
    console.log('Received POST request:', body);
    const { user_id, ...settings } = body;
    const result = await this.notificationSettingsService.createOrUpdate(user_id, settings);
    return { status: 'success', data: result };
  }

  @Get(':userId')
  async findByUserId(@Param('userId') userId: string) {
    const result = await this.notificationSettingsService.findByUserId(userId);
    return { status: 'success', data: result };
  }
}
