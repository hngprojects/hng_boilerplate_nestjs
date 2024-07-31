import {
  Body,
  Controller,
  Param,
  Patch,
  Req,
  Request,
  ValidationPipe,
  Get,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
import { ErrorDto } from './dtos/unread-responseError.dto';
import { UserPayload } from '../user/interfaces/user-payload.interface';

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
    if (is_read === 'false') {
      const notifications = await this.notificationsService.getUnreadNotificationsForUser(userId);
      return {
        status: 'success',
        message: 'Unread notifications retrieved successfully',
        status_code: 200,
        data: notifications,
      };
    }
  }
}
