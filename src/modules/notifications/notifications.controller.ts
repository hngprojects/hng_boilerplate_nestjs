import { Controller, Get, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: { user: UserPayload }) {
    const userId = req.user.id;
    try {
      const notifications = await this.notificationsService.getNotificationsForUser(userId);
      return {
        status_code: 200,
        message: 'Notifications retrieved successfully.',
        data: notifications,
      };
    } catch (error) {
      return {
        status_code: 500,
        message: 'Failed to retrieve notifications.',
        data: null,
      };
    }
  }
}
