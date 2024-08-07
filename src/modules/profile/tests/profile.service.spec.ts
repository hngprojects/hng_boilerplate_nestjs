import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { DeactivateProfileDto } from '../dto/deactivate-profile.dto';

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
      const user = { id: userId, profile: { id: 'profile-uuid', user_id: userId, deactivated: false } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOneProfile(userId);
      expect(result).toEqual({
        message: 'Successfully fetched profile',
        data: user.profile,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'some-uuid';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneProfile(userId)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if profile is not found', async () => {
      const userId = 'some-uuid';
      const user = { id: userId, profile: null } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

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
      const user = { id: userId, profile: { id: 'profile-uuid', bio: 'Old bio', deactivated: false } } as any;
      const updatedProfile = { ...user.profile, ...updateProfileDto };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
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
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw NotFoundException if profile is not found', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId, profile: null } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId, profile: { id: 'profile-uuid', bio: 'Old bio', deactivated: false } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'update').mockRejectedValue(new Error('Something went wrong'));

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deactivateProfile', () => {
    it('should deactivate and return the profile successfully', async () => {
      const userId = 'some-uuid';
      const deactivateProfileDto: DeactivateProfileDto = {
        reason: 'No longer needed',
        confirmation: false,
      };
      const user = { id: userId, profile: { id: 'profile-uuid', deactivated: false } } as any;
      const updatedProfile = { ...user.profile, deactivated: true, deactivation_reason: deactivateProfileDto.reason };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'save').mockResolvedValue(updatedProfile);

      const result = await service.deactivateProfile(userId, deactivateProfileDto);

      expect(result).toEqual(updatedProfile);
      expect(profileRepository.save).toHaveBeenCalledWith({
        ...user.profile,
        deactivated: true,
        deactivation_reason: deactivateProfileDto.reason,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'some-uuid';
      const deactivateProfileDto: DeactivateProfileDto = {
        reason: 'No longer needed',
        confirmation: false,
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deactivateProfile(userId, deactivateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw NotFoundException if profile is not found', async () => {
      const userId = 'some-uuid';
      const deactivateProfileDto: DeactivateProfileDto = {
        reason: 'No longer needed',
        confirmation: false,
      };
      const user = { id: userId, profile: null } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.deactivateProfile(userId, deactivateProfileDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw UnauthorizedException if profile is already deactivated', async () => {
      const userId = 'some-uuid';
      const deactivateProfileDto: DeactivateProfileDto = {
        reason: 'No longer needed',
        confirmation: false,
      };
      const user = { id: userId, profile: { id: 'profile-uuid', deactivated: true } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.deactivateProfile(userId, deactivateProfileDto)).rejects.toThrow(UnauthorizedException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw InternalServerErrorException on unexpected errors', async () => {
      const userId = 'some-uuid';
      const deactivateProfileDto: DeactivateProfileDto = {
        reason: 'No longer needed',
        confirmation: false,
      };
      const user = { id: userId, profile: { id: 'profile-uuid', deactivated: false } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'save').mockRejectedValue(new Error('Unexpected error'));

      await expect(service.deactivateProfile(userId, deactivateProfileDto)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
