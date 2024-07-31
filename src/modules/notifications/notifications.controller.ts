import { Controller, Get, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      example: {
        status: 'success',
        status_code: 200,
        message: 'Notifications retrieved successfully',
        data: {
          total_notification_count: 10,
          total_unread_notification_count: 2,
          notifications: [
            {
              notification_id: 1,
              is_read: false,
              message: 'New message received',
              created_at: '2023-07-30T12:34:56Z',
            },
            {
              notification_id: 2,
              is_read: true,
              message: 'Your order has been shipped',
              created_at: '2023-07-29T11:22:33Z',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve notifications.',
    schema: {
      example: {
        status: 'error',
        message: 'Failed to retrieve notifications.',
        status_code: 500,
        data: null,
      },
    },
  })
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
