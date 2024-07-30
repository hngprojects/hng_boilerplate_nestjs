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
        status: 'success',
        status_code: 200,
        message: 'Notifications retrieved successfully',
        data: {
          total_notification_count: notifications.totalNotificationCount,
          total_unread_notification_count: notifications.totalUnreadNotificationCount,
          notifications: notifications.notifications.map(notification => ({
            notification_id: notification.id,
            is_read: notification.is_Read,
            message: notification.message,
            created_at: notification.created_at,
          })),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to retrieve notifications.',
        status_code: 500,
        data: null,
      };
    }
  }
}
