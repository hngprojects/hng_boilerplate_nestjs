import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { User } from '../user/entities/user.entity';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getNotificationsForUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const notifications = await this.notificationRepository.find({
        where: { user: { id: userId } },
        order: { created_at: 'DESC' },
      });

      const totalNotificationCount = notifications.length;
      const totalUnreadNotificationCount = notifications.filter(notification => !notification.is_read).length;
      return {
        totalNotificationCount,
        totalUnreadNotificationCount,
        notifications,
      };
    } catch (error) {
      Logger.error(
        `Failed to retrieve notifications for user with ID ${userId}: ${error.message}`,
        error.stack,
        'NotificationsService'
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve notifications.');
    }
  }

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
      const notifications = await this.notificationRepository.find({
        where: {
          user: {
            id: userId,
          },
          is_read: false,
        },
      });

      if (notifications.length > 0) {
        notifications.forEach(notifications => {
          notifications.is_read = true;
        });
        await this.notificationRepository.save(notifications);
      }

      return {
        status: 'success',
        status_code: HttpStatus.OK,
        message: 'Notifications cleared successfully.',
        data: { notifications: [] },
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
}
