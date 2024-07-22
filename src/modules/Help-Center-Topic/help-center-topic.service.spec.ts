import { HelpCenterService } from './help-center.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpCenterTopic } from '../../database/entities/help-center-topic.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('Help Center Service Tests', () => {
  let service: HelpCenterService;
  let repository: Repository<HelpCenterTopic>;
  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(id => {
      if (id.where.id === '06f2ec05-8269-407d-8e0a-d1348d03c863') {
        return Promise.resolve({
          id: '06f2ec05-8269-407d-8e0a-d1348d03c863',
          title: 'Test title',
          content: 'Test content',
          author: 'Test author',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        return Promise.resolve(null);
      }
    }),
    delete: jest.fn().mockImplementation(() => Promise.resolve({ affected: 1 })),
  };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        HelpCenterService,
        {
          provide: getRepositoryToken(HelpCenterTopic),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = moduleRef.get<HelpCenterService>(HelpCenterService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Delete a topic', () => {
    it('Should delete a help center topic', async () => {
      const id = '06f2ec05-8269-407d-8e0a-d1348d03c863';
      await service.deleteTopic(id);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(mockUserRepository.delete).toHaveBeenCalledWith(id);
    });

    it('Should throw err, Topic not found', async () => {
      try {
        const id = '06f2ec05-8269-407d-8e0a';
        await service.deleteTopic(id);
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error).toEqual(
          new HttpException(
            { success: false, message: 'Topic not found', status_code: 'Not Found' },
            HttpStatus.NOT_FOUND
          )
        );
      }
    });
  });
});
