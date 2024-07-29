import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notifications.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>
  ) {}

  async markNotificationAsRead(options: MarkNotificationAsReadDto, notificationId: string, userId: string) {
    try {
      if (!notificationId || !options) {
        throw new BadRequestException({
          status: 'error',
          message: 'Invalid Request',
          status_code: HttpStatus.BAD_REQUEST,
        });
      }

      const notificationExists = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notificationExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Notification not found',
          status_code: HttpStatus.NOT_FOUND,
        });
      }

      notificationExists.is_read = options.is_read;
      await this.notificationRepository.save(notificationExists);

      const { id: notification_id, message, is_read, updated_at } = notificationExists;

      return {
        status: 'success',
        message: 'Notification marked as read successfully',
        status_code: HttpStatus.OK,
        data: {
          notification_id,
          message,
          is_read,
          updated_at,
        },
      };
    } catch (error) {
      if (
        error instanceof HttpException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async markAllNotificationsAsReadForUser(userId: string) {
    try {
      if (!userId) {
        throw new BadRequestException({
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Invalid Request',
          data: null,
        });
      }

      const notifications = await this.notificationRepository.find({
        where: {
          user: {
            id: userId,
          },
          isRead: false,
        },
      });

      if (notifications.length > 0) {
        notifications.forEach(notifications => {
          notifications.isRead = true;
        });
        await this.notificationRepository.save(notifications);
      }

      return {
        status_code: HttpStatus.OK,
        message: 'Notifications cleared successfully.',
        data: { notifications: [] },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        console.error('An unexpected error ocurred', error);
        throw new HttpException(
          {
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Failed to clear notifications',
            data: null,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
