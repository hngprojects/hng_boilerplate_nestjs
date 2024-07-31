import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from '../profile.service';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { NotFoundException, InternalServerErrorException, UnauthorizedException, HttpStatus } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import * as path from 'path';
import * as fs from 'fs';
import { Express } from 'express';
import { Readable } from 'stream';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepository: Repository<User>;
  let profileRepository: Repository<Profile>;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        update: jest.fn(),
      },
    } as unknown as QueryRunner;

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
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn().mockReturnValue(queryRunner),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    dataSource = module.get<DataSource>(DataSource);
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
      const user = { id: userId, email: 'test@example.com', profile: { profile_pic_url: 'old_pic.jpg' } } as User;
      const updatedProfile = { profile_pic_url: `profile-pic__${userId}--new.jpg` } as Profile;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(profileRepository, 'findOne').mockResolvedValue(user.profile);
      jest.spyOn(fs.promises, 'rmdir').mockResolvedValue(undefined);
      jest.spyOn(fs.promises, 'rename').mockResolvedValue(undefined);
      jest.spyOn(profileRepository, 'update').mockResolvedValue(undefined);

      const result = await service.updateUserProfilePicture(
        mockFile,
        userId,
        'http://localhost',
        path.join(process.cwd(), '/public/uploads/user-profile-img')
      );

      expect(result.status).toEqual(201);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateUserProfilePicture(mockFile, userId, '', '')).rejects.toThrow(UnauthorizedException);
    });
  });
});
