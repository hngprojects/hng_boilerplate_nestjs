import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { IMessageInterface } from '../email/interface/message.interface';
import { NotificationSettingsDto } from '../settings/notification-settings/dto/notification-settings.dto';
import UserInterface from '../user/interfaces/UserInterface';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    private readonly emailService: EmailService
  ) {}
  async createNotification(
    createNotificationDto: CreateNotificationDto,
    notificationsPreference: NotificationSettingsDto,
    user: Partial<UserInterface>
  ) {
    try {
      if (!user) {
        throw new BadRequestException({
          status: 'error',
          error: 'Not Found',
          status_code: HttpStatus.NOT_FOUND,
        });
      }

      const { email, first_name, last_name } = user;
      const { message } = createNotificationDto;

      const notification = await this.notificationRepository.save({
        ...createNotificationDto,
        user,
      });

      const { email_notifications } = notificationsPreference;

      const notificationEmailProps: IMessageInterface = {
        recipient_name: `${first_name} ${last_name}`,
        message,
        // TODO: Add support email to the environment variables
        // supportEmail: process.env.SUPPORT_EMAIL
        support_email: 'test@example.com',
      };

      if (email_notifications) {
        await this.emailService.sendNotificationMail(email, notificationEmailProps);
      }

      return {
        status_code: HttpStatus.OK,
        message: 'Notification created successfully',
        data: {
          notifications: [
            {
              id: notification.id,
              user_id: notification.user.id,
              message: notification.message,
              is_read: notification.is_read,
              created_at: notification.created_at,
            },
          ],
        },
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException ||
        err instanceof UnauthorizedException
      ) {
        throw err;
      } else {
        throw new InternalServerErrorException({
          err: `An internal server err occurred: ${err.message}`,
        });
      }
    }
  }
}
