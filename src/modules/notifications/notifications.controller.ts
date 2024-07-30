import { Controller, Get, Req, Query, NotFoundException, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserPayload } from '../user/interfaces/user-payload.interface';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Unread notifications retrieved successfully',
    schema: {
      example: {
        status: 'success',
        message: 'Unread notifications retrieved successfully',
        status_code: 200,
        data: [
          {
            id: '123',
            message: 'Notification message',
            read: false,
            createdAt: '2024-07-30T12:34:56Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or User not found',
    schema: {
      example: {
        status: 'error',
        message: 'Invalid request',
        status_code: 400,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve unread notifications',
    schema: {
      example: {
        status: 'error',
        message: 'Failed to retrieve unread notifications',
        status_code: 500,
      },
    },
  })
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
      } else if (isRead === 'true') {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid request',
          status_code: 400,
        });
      } else {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid request',
          status_code: 400,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 'error',
          message: 'User not found',
          status_code: 400,
        };
      } else {
        return {
          status: 'error',
          message: 'Failed to retrieve unread notifications',
          status_code: 500,
        };
      }
    }
  }
}
