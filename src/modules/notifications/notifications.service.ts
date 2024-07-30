import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { IMessageInterface } from '../email/interface/message.interface';
import { NotificationSettingsResponseDto } from '../settings/notification-settings/dto/notification-settings-response.dto';
import { NotificationSettingsService } from '../settings/notification-settings/notification-settings.service';
import UserInterface from '../user/interfaces/UserInterface';
import UserService from '../user/user.service';
import { CreateNotificationError } from './dto/create-notification-error.dto';
import { CreateNotificationPropsDto } from './dto/create-notification-props.dto';
import { CreateNotificationResponseDto } from './dto/create-notification-response.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    private readonly notificationSettingsService: NotificationSettingsService
  ) {}
  async createNotification(
    user_id: string,
    notification_content: CreateNotificationPropsDto
  ): Promise<CreateNotificationResponseDto | CreateNotificationError> {
    const user = await this.getUser(user_id);

    const notification_settings: NotificationSettingsResponseDto = await this.getNotificationSettingsById(user_id);

    await this.sendNotificationEmail(user, notification_content.message, notification_settings);
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

  private async getNotificationSettingsById(user_id: string): Promise<NotificationSettingsResponseDto> {
    try {
      return await this.notificationSettingsService.findByUserId(user_id);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private async sendNotificationEmail(
    user: Partial<UserInterface>,
    message: string,
    notificationSettings: NotificationSettingsResponseDto
  ): Promise<void> {
    const { email, first_name, last_name } = user; // TODO: Implement mobile_push_notification using firebase
    const {
      mobile_push_notifications,
      email_notification_activity_in_workspace,
      email_notification_always_send_email_notifications,
      email_notification_email_digest,
      email_notification_announcement_and_update_emails,
      slack_notifications_activity_on_your_workspace,
      slack_notifications_always_send_email_notifications,
      slack_notifications_announcement_and_update_emails,
    } = notificationSettings;

    const notificationEmailProps: IMessageInterface = {
      recipient_name: `${first_name} ${last_name}`,
      message,
      support_email: process.env.SUPPORT_EMAIL,
    };

    if (email_notification_always_send_email_notifications || email_notification_activity_in_workspace) {
      try {
        await this.emailService.sendNotificationMail(email, notificationEmailProps);
      } catch (err) {
        throw new InternalServerErrorException();
      }
    }
  }

  private async saveNotification(
    user: Partial<UserInterface>,
    notification_content: CreateNotificationPropsDto
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
