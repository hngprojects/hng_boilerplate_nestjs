import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Request, Req, Patch } from '@nestjs/common';
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

    const user_id = user.id;

    const settings = await this.notificationSettingsService.create(notificationSettingsDto, user_id);
    return {
      status: 'success',
      data: settings,
    };
  }

  @Get('notification-settings')
  @ApiOkResponse({
    description: 'Find notification settings by user ID',
    type: NotificationSettings,
  })
  async findByUserId(@Req() request: Request) {
    const user = request['user'];

    const user_id = user.id;

    const settings = await this.notificationSettingsService.findByUserId(user_id);
    return {
      status: 'success',
      data: settings,
    };
  }

  @Patch('notification-settings')
  @ApiOkResponse({
    description: 'Update notification settings successfully',
    type: NotificationSettings,
  })
  async update(@Body() notificationSettingsDto: NotificationSettingsDto, @Req() request: Request) {
    const user = request['user'];

    const user_id = user.id;

    const updatedSettings = await this.notificationSettingsService.create(notificationSettingsDto, user_id);
    return {
      status: 'success',
      data: updatedSettings,
    };
  }
}
