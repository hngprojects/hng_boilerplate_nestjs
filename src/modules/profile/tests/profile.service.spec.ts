import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { NotFoundException, InternalServerErrorException, HttpStatus } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as sharp from 'sharp';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { PICTURE_UPDATED } from '../../../helpers/SystemMessages';
import { mockUser } from '../../../modules/invite/mocks/mockUser';
import { mockUserWithProfile } from '../mocks/mockUser';
jest.mock('fs/promises');
jest.mock('sharp');
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
          useValue: {
            findOne: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            update: jest.fn(),
            findOne: jest.fn(),
            softDelete: jest.fn(),
          },
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
      const user = { id: userId, profile: { id: 'profile-uuid', user_id: userId } } as any;

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
      const user = { id: userId, profile: { id: 'profile-uuid', bio: 'Old bio' } } as any;
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
      const user = { id: userId, profile: { id: 'profile-uuid', bio: 'Old bio' } } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'update').mockRejectedValue(new Error('Something went wrong'));

      await expect(service.updateProfile(userId, updateProfileDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteProfile', () => {
    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUserProfile('nonexistentUserId')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistentUserId' },
        relations: ['profile'],
      });
    });

    it('should throw NotFoundException if user profile is not found', async () => {
      const user = { id: 'existingUserId', profile: null } as any;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(service.deleteUserProfile('existingUserId')).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'existingUserId' }, relations: ['profile'] });
    });

    it('should throw NotFoundException if profile is not found in profileRepository', async () => {
      const user = { id: 'existingUserId', profile: { id: 'profileId' } } as any;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteUserProfile('existingUserId')).rejects.toThrow(NotFoundException);
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

      expect(result).toEqual({ message: 'Profile successfully deleted' });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 'existingUserId' }, relations: ['profile'] });
      expect(profileRepository.findOne).toHaveBeenCalledWith({ where: { id: 'profileId' } });
      expect(profileRepository.softDelete).toHaveBeenCalledWith('profileId');
    });
  });

  describe('uploadProfilePicture', () => {
    const userId = 'testUserId';
    const baseUrl = 'http://localhost:3000';
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
    };
    const mockUploadProfilePicDto = { file: mockFile as any };

    it('should throw an exception if no file is provided', async () => {
      await expect(service.uploadProfilePicture(userId, { file: null }, baseUrl)).rejects.toThrow(CustomHttpException);
    });

    it('should throw an exception if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.uploadProfilePicture(userId, mockUploadProfilePicDto, baseUrl)).rejects.toThrow(
        CustomHttpException
      );
    });

    it('should throw an exception if profile is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUserWithProfile);
      (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      } as any);

      await expect(service.uploadProfilePicture(userId, mockUploadProfilePicDto, baseUrl)).rejects.toThrow(
        CustomHttpException
      );
    });

    it('should delete previous profile picture if it exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(null);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockUser.profile);

      (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      } as any);

      const mockUnlink = jest.spyOn(fs, 'unlink').mockResolvedValue(undefined);
      const mockAccess = jest.spyOn(fs, 'access').mockResolvedValue(undefined);

      await service.uploadProfilePicture(userId, mockUploadProfilePicDto, baseUrl);

      expect(mockAccess).toHaveBeenCalled();
      expect(mockUnlink).toHaveBeenCalled();
    });

    it('should handle non-existent previous profile picture', async () => {
      const mockResult: UpdateResult = {
        generatedMaps: [],
        raw: [],
        affected: 1,
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(mockResult);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockUser.profile);

      (fs.access as jest.Mock).mockRejectedValue({ code: 'ENOENT' });

      (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      } as any);

      await expect(service.uploadProfilePicture(userId, mockUploadProfilePicDto, baseUrl)).resolves.not.toThrow();
    });

    it('should save new profile picture and update profile', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      (sharp as jest.MockedFunction<typeof sharp>).mockReturnValue({
        resize: jest.fn().mockReturnThis(),
        toFile: jest.fn().mockResolvedValue(undefined),
      } as any);

      const mockResult: UpdateResult = {
        generatedMaps: [],
        raw: [],
        affected: 1,
      };

      jest.spyOn(profileRepository, 'update').mockResolvedValue(mockResult);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(mockUser.profile);

      const result = await service.uploadProfilePicture(userId, mockUploadProfilePicDto, baseUrl);

      expect(result).toEqual({
        status: HttpStatus.OK,
        message: PICTURE_UPDATED,
        data: { profile_picture_url: `${baseUrl}/uploads/${userId}.jpg` },
      });
      expect(sharp).toHaveBeenCalled();
      expect(profileRepository.update).toHaveBeenCalled();
    });
  });
});
