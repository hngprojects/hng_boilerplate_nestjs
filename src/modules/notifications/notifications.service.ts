import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notifications.entity';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { Repository } from 'typeorm';

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
        relations: ['user'],
      });

      if (!notificationExists) {
        throw new NotFoundException({
          status: 'error',
          message: 'Notification not found',
          status_code: HttpStatus.NOT_FOUND,
        });
      }

      notificationExists.isRead = options.is_read;
      await this.notificationRepository.save(notificationExists);

      const { id: notification_id, message, isRead: is_read, updated_at } = notificationExists;

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
}
