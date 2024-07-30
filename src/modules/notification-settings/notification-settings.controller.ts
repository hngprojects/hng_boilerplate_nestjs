import { NotificationSettingsResponseDto } from './dto/notification-settings-response.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Post, Body, Get, Request, Req, Patch } from '@nestjs/common';
import { NotificationSettingsService } from './notification-settings.service';
import { NotificationSettingsDto } from './dto/notification-settings.dto';
import { NotificationSettings } from './entities/notification-setting.entity';
import { NotificationSettingsErrorDto } from './dto/notification-settings-error.dto';

@ApiBearerAuth()
@ApiTags('Notification Settings')
@Controller('settings')
export class NotificationSettingsController {
  constructor(private readonly notificationSettingsService: NotificationSettingsService) {}

  @Get('notification-settings')
  @ApiOkResponse({
    description: 'Find notification settings by user ID',
    type: NotificationSettingsResponseDto,
  })
  @ApiUnauthorizedResponse({ type: NotificationSettingsErrorDto, description: 'Unauthorized' })
  @ApiBadRequestResponse({ type: NotificationSettingsErrorDto, description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ type: NotificationSettingsErrorDto, description: 'Internal Server Error' })
  async findNotificationSettingsByUserId(@Req() request: Request) {
    const user = request['user'];

    const user_id = user.id;

    const settings = await this.notificationSettingsService.findNotificationSettingsByUserId(user_id);
    return {
      status: 'success',
      data: settings,
    };
  }

  @Patch('notification-settings')
  @ApiBody({ type: NotificationSettingsDto })
  @ApiOkResponse({
    description: 'Update notification settings successfully',
    type: NotificationSettingsResponseDto,
  })
  @ApiUnauthorizedResponse({ type: NotificationSettingsErrorDto, description: 'Unauthorized' })
  @ApiBadRequestResponse({ type: NotificationSettingsErrorDto, description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ type: NotificationSettingsErrorDto, description: 'Internal Server Error' })
  async updateNotificationSettings(
    @Body() notificationSettingsDto: Partial<NotificationSettingsDto>,
    @Req() request: Request
  ) {
    const user = request['user'];

    const user_id = user.id;
    const { ...notificationSettings } = notificationSettingsDto;
    const updatedSettings = await this.notificationSettingsService.updateNotificationSettings(
      user_id,
      notificationSettings
    );
    return {
      status: 'success',
      message: 'Notification preferences updated successfully',
      data: updatedSettings,
    };
  }
}
