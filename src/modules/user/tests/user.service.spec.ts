import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import UserService from '../user.service';
import { User } from '../entities/user.entity';
import CreateNewUserOptions from '../options/CreateNewUserOptions';
import UserResponseDTO from '../dto/user-response.dto';
import UserIdentifierOptionsType from '../options/UserIdentifierOptions';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from '../dto/update-user-dto';

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

  describe('updateUser', () => {
    it('should update user successfully with valid id', async () => {
      const userId = 'valid-id';
      const updateOptions = {
        first_name: 'Jane',
        last_name: 'Doe',
        phone_number: '1234567890',
      };
      const existingUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '0987654321',
      };
      const updatedUser = { ...existingUser, ...updateOptions };

      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.save.mockResolvedValueOnce(updatedUser);

      const result = await service.updateUser(userId, updateOptions);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw NotFoundException for invalid userId', async () => {
      const userId = 'invalid-id';
      const updateOptions = { first_name: 'Jane' };

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateUser(userId, updateOptions)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should throw BadRequestException for missing userId', async () => {
      const userId = '';
      const updateOptions = { first_name: 'Jane' };

      await expect(service.updateUser(userId, updateOptions)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid request body', async () => {
      const userId = 'valid-id';
      const invalidUpdateOptions = { first_name: 123 } as unknown as UpdateUserDto;
      const existingUser = {
        id: userId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.save.mockRejectedValueOnce(new Error('Invalid field'));

      await expect(service.updateUser(userId, invalidUpdateOptions)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
