import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { HelpCenterService } from '../help-center.service';
import { UpdateHelpCenterDto } from '../dto/update-help-center.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HelpCenter } from '../interface/help-center.interface';
import { HelpCenterEntity } from '../entities/help-center.entity';

describe('HelpCenterService', () => {
  let service: HelpCenterService;
  let repository: Repository<HelpCenterEntity>;

  const mockHelpCenterRepository = () => ({
    update: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HelpCenterService,
        {
          provide: getRepositoryToken(HelpCenterEntity),
          useValue: mockHelpCenterRepository(),
        },
      ],
    }).compile();

    service = module.get<HelpCenterService>(HelpCenterService);
    repository = module.get<Repository<HelpCenter>>(getRepositoryToken(HelpCenterEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateTopic', () => {
    it('should update and return the help center topic', async () => {
      const id = '1';
      const updateHelpCenterDto: UpdateHelpCenterDto = {
        title: 'Updated Title',
        content: 'Updated Content',
        author: 'Updated Author',
      };
      const updatedHelpCenter = { id, ...updateHelpCenterDto };

      jest.spyOn(repository, 'update').mockResolvedValue(undefined);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(updatedHelpCenter as any);

      expect(await service.updateTopic(id, updateHelpCenterDto)).toEqual(updatedHelpCenter);
    });
  });

  describe('removeTopic', () => {
    it('should remove a help center topic', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(undefined);

      await service.removeTopic('1');

      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });
});
