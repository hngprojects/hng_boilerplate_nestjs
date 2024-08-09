import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

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
      const userId = '453e21ff-245f-40c6-92b9-9216157118a8';
      const user = { id: userId, profile: { id: 'profile-uuid', user_id: userId } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      const result = await service.findOneProfile(userId);
      expect(result).toEqual({
        message: 'Request completed successfully',
        data: user.profile,
      });
    });

    it('should throw BadRequestException if user is not found', async () => {
      const userId = 'some-uuid';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOneProfile(userId)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the profile successfully', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId, profile: { id: 'profile-uuid', bio: 'Old bio' } } as any;
      const updatedProfile = { ...user.profile, ...updateProfileDto };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(userId, updateProfileDto);

      expect(result).toEqual({
        message: 'Success',
        data: updatedProfile,
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(CustomHttpException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw NotFoundException if profile is not found', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId, profile: null } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(CustomHttpException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId }, relations: ['profile'] });
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const userId = '1';
      const updateProfileDto: UpdateProfileDto = { bio: 'Updated bio' };
      const user = { id: userId, profile: { id: 'profile-uuid', bio: 'Old bio' } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'update').mockRejectedValue(new CustomHttpException('something went wrong', 404));

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('deleteProfile', () => {
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUserProfile('nonexistentUserId')).rejects.toThrow(CustomHttpException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistentUserId' },
        relations: ['profile'],
      });
    });

    it('should throw NotFoundException if user profile is not found', async () => {
      const user = { id: 'existingUserId', profile: null } as any;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.deleteUserProfile('existingUserId')).rejects.toThrow(CustomHttpException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'existingUserId' }, relations: ['profile'] });
    });

    it('should throw NotFoundException if profile is not found in profileRepository', async () => {
      const user = { id: 'existingUserId', profile: { id: 'profileId' } } as any;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUserProfile('existingUserId')).rejects.toThrow(CustomHttpException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'existingUserId' }, relations: ['profile'] });
      expect(profileRepository.findOne).toHaveBeenCalledWith({ where: { id: 'profileId' } });
    });

    it('should delete the profile successfully', async () => {
      const user = { id: 'existingUserId', profile: { id: 'profileId' } } as any;
      const profile = { id: 'profileId' } as any;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(profile);
      jest.spyOn(profileRepository, 'softDelete').mockResolvedValue(undefined);

      const result = await service.deleteUserProfile('existingUserId');

      expect(result).toEqual({ message: 'Request completed successfully' });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'existingUserId' }, relations: ['profile'] });
      expect(profileRepository.findOne).toHaveBeenCalledWith({ where: { id: 'profileId' } });
      expect(profileRepository.softDelete).toHaveBeenCalledWith('profileId');
    });
  });
});
