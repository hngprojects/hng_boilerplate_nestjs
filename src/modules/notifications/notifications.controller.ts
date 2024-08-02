import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { CreateNotificationError } from './dtos/create-notification-error.dto';
import { CreateNotificationPropsDto } from './dtos/create-notification-props.dto';
import { CreateNotificationResponseDto } from './dtos/create-notification-response.dto';
import { MarkAllNotificationAsReadError } from './dtos/mark-all-notifications-as-read-error.dto';
import { MarkAllNotificationAsReadResponse } from './dtos/mark-all-notifications-as-read.dto';
import { MarkNotificationAsReadErrorDto } from './dtos/mark-notification-as-read-error.dto';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { notificationPropDto } from './dtos/notification-prop.dto';
import { NotificationsService } from './notifications.service';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}
  @Get()
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: notificationPropDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed to retrieve notifications.',
  })
  @ApiOperation({ summary: 'Get notifications' })
  async getNotifications(@Req() req: { user: UserPayload }) {
    const userId = req.user.id;
    const notifications = await this.notificationsService.getNotificationsForUser(userId);

    return {
      status: 'success',
      status_code: 200,
      message: 'Notifications retrieved successfully',
      data: {
        total_notification_count: notifications.totalNotificationCount,
        total_unread_notification_count: notifications.totalUnreadNotificationCount,
        notifications: notifications.notifications.map(({ id, is_read, message, created_at }) => ({
          notification_id: id,
          is_read,
          message,
          created_at,
        })),
      },
    };
  }

  @Post()
  @ApiBody({ type: CreateNotificationPropsDto, description: 'Message and creator of the notification' })
  @ApiCreatedResponse({ type: CreateNotificationResponseDto, description: 'Notification created successfully' })
  @ApiUnauthorizedResponse({ type: CreateNotificationError, description: 'Unauthorized' })
  @ApiBadRequestResponse({ type: CreateNotificationError, description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ type: CreateNotificationError, description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Create notification' })
  async CreateNotifications(
    @Req() req: { user: Partial<UserPayload> },
    @Body() createNotificationPropsDto: Partial<CreateNotificationPropsDto>
  ) {
    const user_id = req.user.id;

    return await this.notificationsService.createNotification(user_id, createNotificationPropsDto);
  }

  @Patch('/:notificationId')
  @ApiBody({ type: MarkNotificationAsReadDto, description: 'Read status of the notification' })
  @ApiOkResponse({ type: CreateNotificationResponseDto, description: 'Notification marked as read successfully' })
  @ApiUnauthorizedResponse({ type: MarkNotificationAsReadErrorDto, description: 'Unauthorized' })
  @ApiBadRequestResponse({ type: MarkNotificationAsReadErrorDto, description: 'Bad Request' })
  @ApiInternalServerErrorResponse({ type: MarkNotificationAsReadErrorDto, description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Marks a single notification as read' })
  async markNotificationAsRead(
    @Param('notificationId') notification_id: string,
    @Body() markNotificationAsRead: MarkNotificationAsReadDto,
    @Req() request: Request
  ) {
    const user = request['user'];

    const userId = user.id;
    return this.notificationsService.markNotificationAsRead(markNotificationAsRead, notification_id, userId);
  }
  @Delete('/clear')
  @ApiOkResponse({ type: MarkAllNotificationAsReadResponse, description: 'Notifications cleared successfully.' })
  @ApiUnauthorizedResponse({ type: MarkAllNotificationAsReadError, description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ type: MarkAllNotificationAsReadError, description: 'Internal Server Error' })
  @ApiOperation({ summary: 'Marks all notifications as read' })
  async markAllNotificationsAsRead(@Req() request: Request) {
    const user = request['user'];

    const userId = user.id;

    return this.notificationsService.markAllNotificationsAsReadForUser(userId);
  }
}
