import { UserPayload } from '../user/interfaces/user-payload.interface';
import { Body, Controller, Param, Patch, Req, Request, Delete, Get, Query, Post, UseGuards } from '@nestjs/common';
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
import { UnreadNotificationsResponseDto } from './dtos/unread-notifications-response.dto';
import { ErrorDto } from './dtos/unread-response-error.dto';
import { notificationPropDto } from './dtos/notification-prop.dto';
import { MarkAllNotificationAsReadResponse } from './dtos/mark-all-notifications-as-read.dto';
import { MarkAllNotificationAsReadError } from './dtos/mark-all-notifications-as-read-error.dto';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { CreateNotificationForAllUsersDto } from './dtos/create-notifiction-all-users.dto';
import { CreateNotificationForAllUsersResDto } from './dtos/create-notification-all-users-res.dto';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/global')
  @UseGuards(SuperAdminGuard)
  @ApiResponse({
    status: 201,
    description: 'A new notification is created successfully',
    type: CreateNotificationForAllUsersResDto,
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Failed to create the notification.',
  })
  async createNotificationsForAllUsers(@Body() dto: CreateNotificationForAllUsersDto) {
    return this.notificationsService.createGlobalNotifications(dto);
  }

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
