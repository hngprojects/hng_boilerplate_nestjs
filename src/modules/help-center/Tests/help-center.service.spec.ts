import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { HelpCenterService } from '../help-center.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenterEntity } from '../entities/help-center.entity';
import { User } from '../../user/entities/user.entity';
import { HELP_CENTER_TOPIC_UPDATED } from '../../../helpers/SystemMessages';

describe('HelpCenterService', () => {
  let service: HelpCenterService;
  let helpCenterRepository: Repository<HelpCenterEntity>;
  let userRepository: Repository<User>;

  const mockHelpCenterRepository = {
    update: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    create: jest.fn().mockImplementation(dto => ({
      ...dto,
      id: '1234',
    })),
    save: jest.fn().mockResolvedValue({
      id: '1234',
      title: 'Sample Title',
      content: 'Sample Content',
      author: 'ADMIN',
    }),
    find: jest.fn().mockResolvedValue([
      {
        id: '1234',
        title: 'Sample Title',
        content: 'Sample Content',
        author: 'ADMIN',
      },
    ]),
    findOne: jest.fn().mockImplementation(options =>
      Promise.resolve(
        options.where.title === 'Sample Title'
          ? {
              id: '1234',
              title: 'Sample Title',
              content: 'Sample Content',
              author: 'ADMIN',
            }
          : null
      )
    ),
    createQueryBuilder: jest.fn().mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        {
          id: '1234',
          title: 'Sample Title',
          content: 'Sample Content',
          author: 'ADMIN',
        },
      ]),
    }),
  };

  const mockUserRepository = {
    findOne: jest.fn().mockImplementation(options =>
      Promise.resolve(
        options.where.id === '123'
          ? {
              id: '123',
              first_name: 'John',
              last_name: 'Doe',
            }
          : null
      )
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelpCenterService,
        {
          provide: getRepositoryToken(HelpCenterEntity),
          useValue: mockHelpCenterRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<HelpCenterService>(HelpCenterService);
    helpCenterRepository = module.get<Repository<HelpCenterEntity>>(getRepositoryToken(HelpCenterEntity));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateTopic', () => {
    it('should update and return the help center topic', async () => {
      const id = '1';
      const updateHelpCenterDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        author: 'Updated Author',
      };
      const responseBody = {
        status_code: 200,
        message: HELP_CENTER_TOPIC_UPDATED,
        data: { ...updateHelpCenterDto, id },
      };
      const updatedHelpCenter = { id, ...updateHelpCenterDto };

      jest.spyOn(helpCenterRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(helpCenterRepository, 'findOneBy').mockResolvedValue(updatedHelpCenter as any);

      expect(await service.updateTopic(id, updateHelpCenterDto)).toEqual(responseBody);
    });
  });

  describe('removeTopic', () => {
    it('should remove a help center topic', async () => {
      jest.spyOn(helpCenterRepository, 'delete').mockResolvedValue(undefined);

      await service.removeTopic('1');

      expect(helpCenterRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
