import { ReactivateAccountDto } from '../dto/reactivate-account.dto';
import { BadRequestException, ForbiddenException, HttpException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import UserService from '../user.service';
import { Profile } from '../../profile/entities/profile.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let profileRepository: Repository<Profile>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
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

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));

    userRepository.save = jest.fn();
  });

  describe('reactivateUser', () => {
    const mockEmail = 'test@example.com';
    const mockUser = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      is_active: false,
      attempts_left: 0,
      time_left: 0,
      email: mockEmail,
    } as any;

    const reactivateAccountDto: ReactivateAccountDto = {
      email: mockEmail,
    };

    it('should reactivate a user successfully', async () => {
      jest.spyOn(service, 'getUserRecord').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.reactivateUser(mockEmail, reactivateAccountDto);

      expect(result).toEqual({
        status: 'success',
        message: 'User Reactivated Successfully',
        user: {
          id: mockUser.id,
          name: `${mockUser.first_name} ${mockUser.last_name}`,
        },
      });
      expect(service.getUserRecord).toHaveBeenCalledWith({
        identifier: mockEmail,
        identifierType: 'email',
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        is_active: true,
        attempts_left: 5,
        time_left: 30 * 60 * 1000,
      });
    });

    it('should throw a CustomHTTPException if user is not found', async () => {
      jest.spyOn(service, 'getUserRecord').mockResolvedValue(null);

      await expect(service.reactivateUser(mockEmail, reactivateAccountDto)).rejects.toThrow(CustomHttpException);
      expect(service.getUserRecord).toHaveBeenCalledWith({
        identifier: mockEmail,
        identifierType: 'email',
      });
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      jest.spyOn(service, 'getUserRecord').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockRejectedValue(new Error('Unexpected error'));

      await expect(service.reactivateUser(mockEmail, reactivateAccountDto)).rejects.toThrow(Error);
      expect(service.getUserRecord).toHaveBeenCalledWith({
        identifier: mockEmail,
        identifierType: 'email',
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        is_active: true,
        attempts_left: 5,
        time_left: 30 * 60 * 1000,
      });
    });
  });
});
