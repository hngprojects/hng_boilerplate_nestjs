import { Controller, Post, Body, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { AuthGuard } from '../../../guards/auth.guard';

@Controller('settings')
//@UseGuards(AuthGuard)
export class NotificationSettingsController {
  constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

  @Post('notification-settings')
  async createOrUpdate(@Body() notificationSettingsDto: NotificationSettingsDto) {
    const settings = await this.notificationSettingsService.createOrUpdate(notificationSettingsDto);
    return {
      status: 'success',
      data: settings,
    };
  }

  @Get('notification-settings/:user_id')
  async findByUserId(@Param('user_id') user_id: string) {
    const settings = await this.notificationSettingsService.findByUserId(user_id);
    return {
      status: 'success',
      data: settings,
    };
  }
}
