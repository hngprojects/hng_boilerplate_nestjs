import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notifications.entity';
import { User } from '../../user/entities/user.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: Repository<Notification>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getUnreadNotificationsForUser', () => {
    it('should return unread notifications for the user', async () => {
      const userId = '1';
      const user = new User();
      user.id = userId;
      const notifications = [new Notification()];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(notificationRepository, 'find').mockResolvedValue(notifications);
      jest.spyOn(notificationRepository, 'count').mockResolvedValue(1);

      const result = await service.getUnreadNotificationsForUser(userId);

      expect(result).toEqual({
        totalNotificationCount: 1,
        totalUnreadNotificationCount: notifications.length,
        notifications,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = '1';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUnreadNotificationsForUser(userId)).rejects.toThrow(NotFoundException);
    });

    it('should handle internal server errors', async () => {
      const userId = '1';

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(new Error('Failed to retrieve'));

      await expect(service.getUnreadNotificationsForUser(userId)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
