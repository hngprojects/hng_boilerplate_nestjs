import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

const mockProfileRepository = () => ({
  findOne: jest.fn(),
});

describe('ProfileService', () => {
  let service: ProfileService;
  let repository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService, { provide: getRepositoryToken(Profile), useFactory: mockProfileRepository }],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  describe('findOneProfile', () => {
    it('should return profile data if found', async () => {
      const profile = { id: '1', name: 'John Doe' };
      (repository.findOne as jest.Mock).mockResolvedValue(profile);

      const result = await service.findOneProfile('1');

      expect(result).toEqual({
        message: 'Successfully fetched profile',
        data: profile,
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      (repository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.findOneProfile('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if there is a database error', async () => {
      (repository.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(service.findOneProfile('1')).rejects.toThrow(InternalServerErrorException);
    });
  });
});
