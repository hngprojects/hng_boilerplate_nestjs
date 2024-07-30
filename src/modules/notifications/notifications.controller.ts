import { Body, Controller, Param, Patch, Req, Request, ValidationPipe } from '@nestjs/common';
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

@ApiBearerAuth()
@ApiTags('Notification')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

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
}
