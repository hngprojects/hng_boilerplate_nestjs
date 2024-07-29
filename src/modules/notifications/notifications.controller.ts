import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { NotificationSettingsResponseDto } from '../settings/notification-settings/dto/notification-settings-response.dto';
import { NotificationSettingsService } from '../settings/notification-settings/notification-settings.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import UserInterface from '../user/interfaces/UserInterface';
import UserService from '../user/user.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationSettingsService: NotificationSettingsService,
    private readonly userService: UserService
  ) {}

  @Post()
  @ApiBody({ type: CreateNotificationDto, description: 'Notification message' })
  @ApiCreatedResponse({ description: 'Notification created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto, @Req() req: { user: UserPayload }) {
    const userId = req?.user.id;
    const { message } = createNotificationDto;

    const user: Partial<UserInterface> = await this.userService.getUserRecord({
      identifier: userId,
      identifierType: 'id',
    });

    const notificationSettingsPreference: NotificationSettingsResponseDto =
      await this.notificationSettingsService.findByUserId(user.id);

    const { id, created_at, updated_at, user_id, ...notificationSettingsPreferenceRest } =
      notificationSettingsPreference;

    const createNotificationProps: CreateNotificationDto = {
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    return this.notificationsService.createNotification(
      createNotificationProps,
      notificationSettingsPreferenceRest,
      user
    );
  }
}
