import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications.service';
import { Notification } from '../entities/notification.entity';
import { User } from '../../user/entities/user.entity';
import { InternalServerErrorException } from '@nestjs/common';

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getNotificationsForUser', () => {
    it('should throw an exception if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getNotificationsForUser('non-existent-id')).rejects.toThrow(
        new InternalServerErrorException('User not found')
      );
    });

    it('should return notifications for a valid user', async () => {
      const user = new User();
      user.id = 'valid-user-id';
      user.notifications = [];

      const notifications = [
        { id: '1', message: 'Test 1', is_Read: false, user } as Notification,
        { id: '2', message: 'Test 2', is_Read: true, user } as Notification,
      ];

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(notificationRepository, 'find').mockResolvedValue(notifications);

      const result = await service.getNotificationsForUser('valid-user-id');

      expect(result.totalNotificationCount).toBe(2);
      expect(result.totalUnreadNotificationCount).toBe(1);
      expect(result.notifications).toEqual(notifications);
    });

    it('should throw an exception if there is an error retrieving notifications', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(new User());
      jest.spyOn(notificationRepository, 'find').mockRejectedValue(new Error('Some error'));

      await expect(service.getNotificationsForUser('valid-user-id')).rejects.toThrow(
        new InternalServerErrorException('Failed to retrieve notifications.')
      );
    });
  });
});
