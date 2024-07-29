import { Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotificationSettingsService } from './notification-settings.service';

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
  @Get('notification-settings')
  async findByUserId(@Req() request: Request) {
    const user = request['user'];

    const user_id = user.id;

    const settings = await this.notificationSettingsService.findByUserId(user_id);
    return {
      status: 'success',
      data: settings,
    };
  }
}
