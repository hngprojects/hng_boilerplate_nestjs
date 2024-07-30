import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notifications.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getUnreadNotificationsForUser(userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('Invalid request: User not found');
      }

      const notifications = await this.notificationRepository.find({
        where: { user: { id: userId }, is_Read: false },
        order: { created_at: 'DESC' },
      });

      const totalNotificationCount = await this.notificationRepository.count({ where: { user: { id: userId } } });
      const totalUnreadNotificationCount = notifications.length;

      return {
        totalNotificationCount,
        totalUnreadNotificationCount,
        notifications,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new BadRequestException('Invalid request: User not found');
      }
      throw new InternalServerErrorException('Failed to retrieve unread notifications.');
    }
  }
}
