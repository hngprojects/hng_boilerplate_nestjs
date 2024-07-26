import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Request, Req } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { NotificationSettings } from './entities/notification-setting.entity';

@ApiBearerAuth()
@ApiTags('Notification Settings')
@Controller('settings')
export class NotificationSettingsController {
  constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

  @Post('notification-settings')
  @ApiOkResponse({
    description: 'Create or update notification settings',
    type: NotificationSettings,
  })
  async create(@Body() notificationSettingsDto: NotificationSettingsDto, @Req() request: Request) {
    const user = request['user'];

    const userId = user.id;

    const settings = await this.notificationSettingsService.create(notificationSettingsDto, userId);
    return {
      status: 'success',
      data: settings,
    };
  }

  @Get('notification-settings')
  async findByUserId(@Req() request: Request) {
    const user = request['user'];

    const userId = user.id;

    const settings = await this.notificationSettingsService.findByUserId(userId);
    return {
      status: 'success',
      data: settings,
    };
  }
}

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
