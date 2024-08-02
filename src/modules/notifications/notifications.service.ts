import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { IMessageInterface } from '../email/interface/message.interface';
import { NotificationSettingsDto } from '../notification-settings/dto/notification-settings.dto';
import { NotificationSettings } from '../notification-settings/entities/notification-setting.entity';
import { NotificationSettingsService } from '../notification-settings/notification-settings.service';
import { User } from '../user/entities/user.entity';
import UserInterface from '../user/interfaces/UserInterface';
import UserService from '../user/user.service';
import { CreateNotificationError } from './dtos/create-notification-error.dto';
import { CreateNotificationPropsDto } from './dtos/create-notification-props.dto';
import { CreateNotificationResponseDto } from './dtos/create-notification-response.dto';
import { MarkNotificationAsReadDto } from './dtos/mark-notification-as-read.dto';
import { Notification } from './entities/notifications.entity';
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,

    @InjectRepository(NotificationSettings)
    private readonly notificationSettingsRepository: Repository<NotificationSettings>,

    private readonly logger: Logger,

    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly notificationSettingsService: NotificationSettingsService,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  private getEmailTemplate(recipient_name: string, message: string): IMessageInterface {
    return {
      recipient_name,
      message,
      support_email: process.env.SUPPORT_EMAIL,
    };
  }

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

  async createNotification(
    user_id: string,
    notification_content: Partial<CreateNotificationPropsDto>
  ): Promise<CreateNotificationResponseDto | CreateNotificationError> {
    const user = await this.getUser(user_id);

    const notification_settings = await this.getNotificationSettingsByUserId(user_id);

    // TODO: Add sendNotificationEmail(user, notification_content.message, notification_settings); when mail service is back

    this.logger.log(`Notification created by ${notification_content.created_by} has been sent to ${user.email}.`);
    const notification = await this.saveNotification(user, notification_content);

    const { id: notification_id, message, is_read, created_at } = notification;

    return {
      status: 'success',
      message: 'Notification created successfully',
      status_code: HttpStatus.CREATED,
      data: {
        notifications: [
          {
            notification_id,
            user_id,
            message,
            is_read,
            created_at,
          },
        ],
      },
    };
  }

  private async getUser(user_id: string): Promise<Partial<UserInterface>> {
    const user: Partial<UserInterface> = await this.userService.getUserRecord({
      identifier: user_id,
      identifierType: 'id',
    });

    if (!user) {
      throw new BadRequestException({
        status: 'error',
        error: 'Not Found',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    return user;
  }

  private async getNotificationSettingsByUserId(user_id: string): Promise<NotificationSettings> {
    try {
      return this.notificationSettingsService.findNotificationSettingsByUserId(user_id);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private async sendNotificationEmail(
    user: Partial<UserInterface>,
    message: string,
    notificationSettings: NotificationSettingsDto
  ): Promise<void> {
    const { email, first_name, last_name } = user;
    // TODO: Implement mobile_push_notification using firebase
    const { email_notification_activity_in_workspace, email_notification_always_send_email_notifications } =
      notificationSettings;

    const notificationEmailProps = this.getEmailTemplate(`${first_name} ${last_name}`, message);

    if (email_notification_always_send_email_notifications || email_notification_activity_in_workspace) {
      try {
        await this.emailService.sendNotificationMail(email, notificationEmailProps);
      } catch (err) {
        throw new InternalServerErrorException();
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  private async scheduleDailyEmailDigest(): Promise<any> {
    try {
      const emailDigestUsers: NotificationSettings[] = await this.notificationSettingsRepository.find({
        where: { email_notification_email_digest: true },
      });

      const allUnreadNotifications: Notification[] = [];

      for (const user of emailDigestUsers) {
        const { user_id } = user;
        const unreadNotifications: Notification[] = await this.notificationRepository.find({
          where: {
            user: {
              id: user_id,
            },
            is_read: false,
          },
          relations: ['user'],
        });

        const selectedNotifications = unreadNotifications.slice(0, 2);

        allUnreadNotifications.push(...selectedNotifications);
      }

      const flattenedUserUnreadNotifications = allUnreadNotifications.flat();

      const parallelEmails = flattenedUserUnreadNotifications.map(async notification => {
        const { email, first_name, last_name } = notification.user;

        const notificationEmailProps: IMessageInterface = this.getEmailTemplate(
          `${first_name} ${last_name}`,
          notification.message
        );

        // TODO: await this.emailService.sendNotificationMail(email, notificationEmailProps);
        this.logger.log(`Notification created by ${notification.created_by} has been sent as digest to ${email}.`);

        notification.is_read = true;

        await this.notificationRepository.save(notification);
      });

      await Promise.all(parallelEmails);
      this.logger.log('All email digest sent successfully.');
    } catch (err) {
      throw new InternalServerErrorException({
        err: 'Could not send email digest.',
      });
    }
  }

  private async saveNotification(
    user: Partial<UserInterface>,
    notification_content: Partial<CreateNotificationPropsDto>
  ): Promise<Notification> {
    try {
      return await this.notificationRepository.save({
        ...notification_content,
        user,
      });
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
