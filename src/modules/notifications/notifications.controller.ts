import { Controller, Get, Req, Query, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUnreadNotifications(@Req() req: { user: UserPayload }, @Query('is_read') isRead: string) {
    const userId = req.user.id;
    try {
      if (isRead === 'false') {
        const notifications = await this.notificationsService.getUnreadNotificationsForUser(userId);
        return {
          status: 'success',
          message: 'Unread notifications retrieved successfully',
          status_code: 200,
          data: notifications,
        };
      } else {
        return {
          status: 'error',
          message: 'Invalid request',
          status_code: 400,
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 'error',
          message: 'User not found',
          status_code: 400,
        };
      }
      return {
        status: 'error',
        message: 'Failed to retrieve unread notifications',
        status_code: 500,
      };
    }
  }
}
