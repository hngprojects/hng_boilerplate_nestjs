import { UserPayload } from '../user/interfaces/user-payload.interface';
import { Body, Controller, Param, Patch, Req, Request, Delete, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { CreateNotificationResponseDto } from './dtos/create-notification-response.dto';
import { MarkNotificationAsReadErrorDto } from './dtos/mark-notification-as-read-error.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { notificationPropDto } from './dtos/notification-prop.dto';
import { MarkAllNotificationAsReadResponse } from './dtos/mark-all-notifications-as-read.dto';
import { MarkAllNotificationAsReadError } from './dtos/mark-all-notifications-as-read-error.dto';

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

  @Patch('/:notificationId')
  @ApiBody({ type: MarkNotificationAsReadDto, description: 'Read status of the notification' })
  @ApiOkResponse({ type: CreateNotificationResponseDto, description: 'Notification created successfully' })
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
  @ApiOperation({ summary: 'Marks all notifications a read' })
  async markAllNotificationsAsRead(@Req() request: Request) {
    const user = request['user'];

    const userId = user.id;

    return this.notificationsService.markAllNotificationsAsReadForUser(userId);
  }
}
