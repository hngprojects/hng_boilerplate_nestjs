import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterSubscriptionService } from '../newsletter-subscription.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NewsletterSubscription } from '../entities/newsletter-subscription.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SuperAdminGuard } from '../../../guards/super-admin.guard';

describe('NewsletterService', () => {
  let service: NewsletterSubscriptionService;
  let repository: Repository<NewsletterSubscription>;

  const mockSuperAdminGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterSubscriptionService,
        {
          provide: getRepositoryToken(NewsletterSubscription),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
          },
        },
        {
          provide: SuperAdminGuard,
          useValue: mockSuperAdminGuard,
        },
      ],
    }).compile();

    service = module.get<NewsletterSubscriptionService>(NewsletterSubscriptionService);
    repository = module.get<Repository<NewsletterSubscription>>(getRepositoryToken(NewsletterSubscription));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('newsletterSubcription', () => {
    it('should return success message if subscription already exists', async () => {
      const dto = { email: 'test@example.com' };
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue({ id: '1', email: 'test@example.com' } as NewsletterSubscription);

      const result = await service.newsletterSubcription(dto);
      expect(result).toEqual({ message: 'Subscriber subscription successful' });
    });

    it('should create new subscription if it does not exist', async () => {
      const dto = { email: 'test@example.com' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(dto as NewsletterSubscription);
      jest.spyOn(repository, 'save').mockResolvedValue(dto as NewsletterSubscription);

      const result = await service.newsletterSubcription(dto);
      expect(result).toEqual({ status: 'success', message: 'Subscriber subscription successful' });
    });
  });

  describe('findAll', () => {
    it('should return an array of subscribers', async () => {
      const subscribers = [{ id: '1', email: 'test@example.com' }];
      jest.spyOn(repository, 'find').mockResolvedValue(subscribers as NewsletterSubscription[]);

      const result = await service.findAll();
      expect(result).toEqual(subscribers);
    });
  });

  describe('remove', () => {
    it('should soft delete a subscriber', async () => {
      const id = '1';
      jest.spyOn(repository, 'findOne').mockResolvedValue({ id, email: 'test@example.com' } as NewsletterSubscription);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.remove(id);
      expect(result).toEqual({ message: `Subscriber with ID ${id} has been soft deleted` });
    });

    it('should throw NotFoundException if subscriber not found', async () => {
      const id = '1';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSoftDeleted', () => {
    it('should return soft-deleted subscribers', async () => {
      const deletedSubscribers = [{ id: '1', email: 'test@example.com', deletedAt: new Date() }];
      jest.spyOn(repository, 'find').mockResolvedValue(deletedSubscribers as NewsletterSubscription[]);

      const result = await service.findSoftDeleted();
      expect(result).toEqual(deletedSubscribers);
    });
  });

  describe('restore', () => {
    it('should restore a soft-deleted subscriber', async () => {
      const id = '1';
      jest.spyOn(repository, 'restore').mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });

      const result = await service.restore(id);
      expect(result).toEqual({ message: `Subscriber with ID ${id} has been restored` });
    });

    it('should throw NotFoundException if subscriber not found or already restored', async () => {
      const id = '1';
      jest.spyOn(repository, 'restore').mockResolvedValue({ affected: 0, raw: {}, generatedMaps: [] });

      await expect(service.restore(id)).rejects.toThrow(NotFoundException);
    });
  });
});
