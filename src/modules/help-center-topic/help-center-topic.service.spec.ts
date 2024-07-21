import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterTopic } from 'src/entities/help-center-topic.entity';
import { Repository } from 'typeorm';
import { helpCenterTopicDto } from './dto/help-center-topic.dto';
import { HelpCenterTopicService } from './help-center-topic.service';

describe('HelpCenterTopicService', () => {
  let service: HelpCenterTopicService;
  let helpCenterTopicRepository: Repository<HelpCenterTopic>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelpCenterTopicService,
        {
          provide: getRepositoryToken(HelpCenterTopic),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<HelpCenterTopicService>(HelpCenterTopicService);
    helpCenterTopicRepository = module.get<Repository<HelpCenterTopic>>(getRepositoryToken(HelpCenterTopic));
  });

  describe('searchTitles', () => {
    it('should return topics if found', async () => {
      const sampleTitle = 'create new';
      const result: HelpCenterTopic[] = [
        {
          id: '1e6e4f1e-4f1e-4f1e-4f1e-4f1e4f1e4f1e',
          title: 'How to create a new account',
          content: 'To create a new account, click on the sign-up button and fill in your details',
          author: 'John Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: null,
        },
        {
          id: '2e6e4f1e-4f1e-4f1e-4f1e-4f1e4f1e4f1e',
          title: 'How to reset your password',
          content: 'To reset your password, click on the reset password button and follow the instructions',
          author: 'Jane Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: null,
        },
      ];

      jest.spyOn(helpCenterTopicRepository, 'find').mockResolvedValue(result);

      const expected: helpCenterTopicDto[] = result.map(topic => {
        const { id, title, content, author } = topic;
        return { id, title, content, author };
      });

      const response = await service.searchTitles(sampleTitle);

      expect(response).toEqual({
        success: true,
        message: 'Topics found',
        status_code: 200,
        topics: expected,
      });
    });

    it('should throw an error if no topics are found', async () => {
      const sampleTitle = "i don't exist";

      jest.spyOn(helpCenterTopicRepository, 'find').mockResolvedValue([]);

      try {
        await service.searchTitles(sampleTitle);
      } catch (error) {
        expect(error.response).toEqual({
          success: false,
          message: 'No topics found',
          status_code: 404,
        });
      }
    });

    it('should throw an error if an internal server error occurs', async () => {
      const sampleTitle = 'create new';

      jest.spyOn(helpCenterTopicRepository, 'find').mockRejectedValue(new Error());

      try {
        await service.searchTitles(sampleTitle);
      } catch (error) {
        expect(error.response).toEqual({
          success: false,
          message: 'Internal server error',
          status_code: 500,
        });
      }
    });
  });
});
