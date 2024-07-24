import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserService from '../user.service';
import { User } from '../entities/user.entity';
import CreateNewUserOptions from '../options/CreateNewUserOptions';
import UserResponseDTO from '../dto/user-response.dto';
import UserIdentifierOptionsType from '../options/UserIdentifierOptions';
import { DeactivateAccountDto } from '../dto/deactivate-account.dto';
import { HttpException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockUserRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateNewUserOptions = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password',
      };

      await service.createUser(createUserDto);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
    });
  });

  describe('getUserRecord', () => {
    it('should return a user by email', async () => {
      const email = 'test@example.com';
      const userResponseDto: UserResponseDTO = {
        id: 'uuid',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userResponseDto);

      const result = await service.getUserRecord({ identifier: email, identifierType: 'email' });
      expect(result).toEqual(userResponseDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email } });
    });

    it('should return a user by id', async () => {
      const id = '1';
      const userResponseDto: UserResponseDTO = {
        id: 'some-uuid-here',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userResponseDto);

      const result = await service.getUserRecord({ identifier: id, identifierType: 'id' });
      expect(result).toEqual(userResponseDto);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
    });

    it('should handle exceptions gracefully', async () => {
      const identifierOptions: UserIdentifierOptionsType = { identifier: 'unknown', identifierType: 'email' };

      mockUserRepository.findOne.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      await expect(service.getUserRecord(identifierOptions)).rejects.toThrow('Test error');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate a user', async () => {
      const userId = '1';
      const deactivationDetails: DeactivateAccountDto = {
        confirmation: true,
        reason: 'User requested deactivation',
      };
      const userToUpdate = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'hashedpassword',
        is_active: true,
        attempts_left: 3,
        time_left: 60,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userToUpdate);

      const result = await service.deactivateUser(userId, deactivationDetails);

      expect(result.is_active).toBe(false);
      expect(result.message).toBe('Account Deactivated Successfully');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...userToUpdate, is_active: false });
    });

    it('should throw an error if user is not found', async () => {
      const userId = '1';
      const deactivationDetails: DeactivateAccountDto = {
        confirmation: true,
        reason: 'User requested deactivation',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.deactivateUser(userId, deactivationDetails)).rejects.toThrow(HttpException);
      await expect(service.deactivateUser(userId, deactivationDetails)).rejects.toHaveProperty('response', {
        status_code: 404,
        error: 'User not found',
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });
});
