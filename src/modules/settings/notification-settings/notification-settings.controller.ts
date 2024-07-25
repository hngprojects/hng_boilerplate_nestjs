import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Post, Body, Get, Param, UseGuards, HttpStatus, Request, Req } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { AuthGuard } from '../../../guards/auth.guard';
import { NotificationSettings } from './entities/notification-setting.entity';

@ApiBearerAuth()
@ApiTags('Notification Settings')
@Controller('settings')

// @UseGuards(AuthGuard)
export class NotificationSettingsController {
  constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

  @Post('notification-settings')
  @ApiOkResponse({
    description: 'Create or update notification settings',
    type: NotificationSettings,
  })
  async create(@Body() notificationSettingsDto: NotificationSettingsDto, @Req() request: Request) {
    const user = request['user'];

    const userId = user.sub;

    const settings = await this.notificationSettingsService.create(notificationSettingsDto, userId);
    return {
      status: 'success',
      data: settings,
    };
  }

  @Get('notification-settings')
  async findByUserId(@Req() request: Request) {
    const user = request['user'];

    const userId = user.sub;

    const settings = await this.notificationSettingsService.findByUserId(userId);
    return {
      status: 'success',
      data: settings,
    };
  }
}
