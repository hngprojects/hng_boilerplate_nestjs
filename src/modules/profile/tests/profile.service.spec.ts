import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: Repository<User>;
  let profileRepository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Profile),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
  });

  describe('findOneProfile', () => {
    it('should return profile data if user and profile are found', async () => {
      const userId = 'some-uuid';
      const user = { id: userId } as User;
      const profile = { user_id: userId } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(profile);

      const result = await service.findOneProfile(userId);
      expect(result).toEqual({
        message: 'Successfully fetched profile',
        data: profile,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'some-uuid';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneProfile(userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if profile is not found', async () => {
      const userId = 'some-uuid';
      const user = { id: userId } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneProfile(userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const userId = 'some-uuid';

      jest.spyOn(userRepository, 'findOne').mockRejectedValue(new Error('Unexpected error'));

      await expect(service.findOneProfile(userId)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the profile successfully', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId } as User;
      const profile = { id: '1', user_id: user, bio: 'Old bio' } as Profile;
      const updatedProfile = { ...profile, ...updateProfileDto };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(profile);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result).toEqual({
        message: 'Profile successfully updated',
        data: updatedProfile,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw NotFoundException if profile is not found', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(profileRepository.findOne).toHaveBeenCalledWith({ where: { user_id: { id: userId } } });
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId } as User;
      const profile = { id: '1', user_id: user, bio: 'Old bio' } as Profile;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(profile);
      jest.spyOn(profileRepository, 'update').mockRejectedValue(new Error('Something went wrong'));

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
