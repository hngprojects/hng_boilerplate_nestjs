import { Body, Controller, Param, Patch, Req, Request, ValidationPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';

@ApiBearerAuth()
@ApiTags('Notification')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Patch('/:notificationId/read')
  async markNotificationAsRead(
    @Param('notificationId') notificationId: string,
    @Body() markNotificationAsRead: MarkNotificationAsReadDto,
    @Req() request: Request
  ) {
    const user = request['user'];

    const userId = user.id;
    return this.notificationsService.markNotificationAsRead(markNotificationAsRead, notificationId, userId);
  }
}
