import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository, QueryRunner } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import {
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  HttpStatus,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import * as path from 'path';
import * as fs from 'fs';
import { Express } from 'express';
import { Readable } from 'stream';
import { ONLY_IMAGE_FILES_ACCEPTED } from '../../../helpers/SystemMessages';

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

  describe('uploadProfilePicture', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'profile_pic_url',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: path.join(process.cwd(), '/public/uploads/user-profile-img'),
      filename: 'test.jpg',
      path: path.join(process.cwd(), '/public/uploads/user-profile-img/test.jpg'),
      size: 1024,
      buffer: null,
      stream: new Readable(),
    };

    const userId = 'some-uuid';

    it('should upload a new profile picture and return the updated profile picture URL', async () => {
      const user = { id: userId, email: 'test3210@example.com' } as User;
      const profile = { id: '1', email: user.email, user_id: user, profile_pic_url: 'old_pic.jpg' } as Profile;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(profile);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(undefined);

      const result = await service.updateUserProfilePicture(mockFile, userId);
      expect(result.status).toEqual(201);
      expect(result.data.profile_picture_url).toBeTruthy();
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUserProfilePicture(mockFile, userId)).rejects.toThrow(UnauthorizedException);
    });

    it('should return bad request if file type is not a supported type', async () => {
      const user = { id: userId, email: 'test3210@example.com' } as User;
      const profile = { id: '1', email: user.email, user_id: user, profile_pic_url: 'old_pic.jpg' } as Profile;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(profile);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(undefined);

      const tempMockFile = { ...mockFile };

      tempMockFile.filename = 'test.js';
      tempMockFile.originalname = 'test.js';
      await expect(service.updateUserProfilePicture(tempMockFile, userId)).rejects.toThrow(BadRequestException);
    });

    it('should return not found if user profile does not exist', async () => {
      const user = { id: userId, email: 'test3210@example.com' } as User;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUserProfilePicture(mockFile, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
