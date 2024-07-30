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
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { CreateNotificationError } from './dto/create-notification-error.dto';
import { CreateNotificationPropsDto, Message } from './dto/create-notification-props.dto';
import { CreateNotificationResponseDto } from './dto/create-notification-response.dto';
import { NotificationsService } from './notifications.service';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiBody({ type: Message, description: 'Notification message' })
  @ApiCreatedResponse({ type: CreateNotificationResponseDto, description: 'Notification created successfully' })
  @ApiUnauthorizedResponse({ type: CreateNotificationError, description: 'Unauthorized' })
  @ApiBadRequestResponse({ type: CreateNotificationError, description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ type: CreateNotificationError, description: 'Internal Server Error' })
  async createNotification(@Body() message: Message, @Req() req: { user: UserPayload }) {
    const user_id = req?.user.id;

    const createNotificationProps: CreateNotificationPropsDto = {
      ...message,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    return this.notificationsService.createNotification(user_id, createNotificationProps);
  }
}
