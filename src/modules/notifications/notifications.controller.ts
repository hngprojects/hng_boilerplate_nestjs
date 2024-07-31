import { Body, Controller, Param, Patch, Req, Request, Get, Query, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
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
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { CreateNotificationResponseDto } from './dtos/create-notification-response.dto';
import { MarkNotificationAsReadErrorDto } from './dtos/mark-notification-as-read-error.dto';
import { UnreadNotificationsResponseDto } from './dtos/unread-notifications-response.dto';
import { ErrorDto } from './dtos/unread-response-error.dto';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { MarkAllNotificationAsReadResponse } from './dtos/mark-all-notifications-as-read.dto';
import { MarkAllNotificationAsReadError } from './dtos/mark-all-notifications-as-read-error.dto';

@ApiBearerAuth()
@ApiTags('Notification')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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
  @ApiOperation({ summary: 'Marks all notifications a read' })
  async markAllNotificationsAsRead(@Req() request: Request) {
    const user = request['user'];

    const userId = user.id;

    return this.notificationsService.markAllNotificationsAsReadForUser(userId);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Unread notifications retrieved successfully',
    type: UnreadNotificationsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or User not found',
    type: ErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve unread notifications',
    type: ErrorDto,
  })
  async getUnreadNotificationsForUser(@Req() req: { user: UserPayload }, @Query('is_read') is_read: string) {
    const userId = req.user.id;
    const notifications = await this.notificationsService.getUnreadNotificationsForUser(userId, is_read);
    return {
      status: 'success',
      message: 'Unread notifications retrieved successfully',
      status_code: 200,
      data: notifications,
    };
  }
}
