import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import UserService from '../user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { DeactivateAccountDto } from '../dto/deactivate-account.dto';
import { UpdateUserDto } from '../dto/update-user-dto';
import UserResponseDTO from '../dto/user-response.dto';
import { User, UserType } from '../entities/user.entity';
import { UserPayload } from '../interfaces/user-payload.interface';
import CreateNewUserOptions from '../options/CreateNewUserOptions';
import UserIdentifierOptionsType from '../options/UserIdentifierOptions';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  let profileRepository: Repository<Profile>;

  const mockUserRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
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
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { email },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
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
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
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
    const userId = 'valid-id';
    const updateOptions: UpdateUserDto = {
      first_name: 'Jane',
      last_name: 'Doe',
      phone_number: '1234567890',
    };
    const existingUser = {
      id: userId,
      first_name: 'John',
      last_name: 'Doe',
      phone_number: '0987654321',
      user_type: UserType.USER,
    };
    const updatedUser = { ...existingUser, ...updateOptions };

    const superAdminPayload: UserPayload = {
      id: 'super-admin-id',
      email: 'superadmin@example.com',
      user_type: UserType.SUPER_ADMIN,
    };

    const regularUserPayload: UserPayload = {
      id: userId,
      email: 'user@example.com',
      user_type: UserType.USER,
    };

    const anotherUserPayload: UserPayload = {
      id: 'another-user-id',
      email: 'anotheruser@example.com',
      user_type: UserType.USER,
    };

    it('should allow super admin to update any user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.save.mockResolvedValueOnce(updatedUser);

      const result = await service.updateUser(userId, updateOptions, superAdminPayload);

      expect(result).toEqual({
        status: 'success',
        message: 'User Updated Successfully',
        user: {
          id: userId,
          name: 'Jane Doe',
          phone_number: '1234567890',
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should allow user to update their own details', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.save.mockResolvedValueOnce(updatedUser);

      const result = await service.updateUser(userId, updateOptions, regularUserPayload);

      expect(result).toEqual({
        status: 'success',
        message: 'User Updated Successfully',
        user: {
          id: userId,
          name: 'Jane Doe',
          phone_number: '1234567890',
        },
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });

    it('should throw ForbiddenException when regular user tries to update another user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);

      await expect(service.updateUser(userId, updateOptions, anotherUserPayload)).rejects.toThrow(ForbiddenException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid userId', async () => {
      const invalidUserId = 'invalid-id';
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateUser(invalidUserId, updateOptions, superAdminPayload)).rejects.toThrow(
        NotFoundException
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: invalidUserId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
    });

    it('should throw BadRequestException for missing userId', async () => {
      const emptyUserId = '';

      await expect(service.updateUser(emptyUserId, updateOptions, superAdminPayload)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for invalid request body', async () => {
      const invalidUpdateOptions = { first_name: 123 } as unknown as UpdateUserDto;
      mockUserRepository.findOne.mockResolvedValueOnce(existingUser);
      mockUserRepository.save.mockRejectedValueOnce(new Error('Invalid field'));

      await expect(service.updateUser(userId, invalidUpdateOptions, superAdminPayload)).rejects.toThrow(
        BadRequestException
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
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
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('getUserByDataByIdWithoutPassword', () => {
    const userId = 'valid-id';
    const userWithoutPassword = {
      id: userId,
      first_name: 'John',
      last_name: 'Doe',
      email: 'test@example.com',
      is_active: true,
    };

    it('should return user data without password', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({ password: 'hashedpassword', ...userWithoutPassword });

      const result = await service.getUserDataWithoutPasswordById(userId);

      expect(result.user).toEqual(userWithoutPassword);
      expect(result.user).not.toHaveProperty('password');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
    });
  });

  describe('getAllUsers', () => {
    const page = 1;
    const limit = 10;
    const superAdminPayload: UserPayload = {
      id: 'super-admin-id',
      email: 'superadmin@example.com',
      user_type: UserType.SUPER_ADMIN,
    };
    const regularUserPayload: UserPayload = {
      id: 'regular-user-id',
      email: 'user@example.com',
      user_type: UserType.USER,
    };

    it('should return users when called by super admin', async () => {
      const users = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          is_active: true,
          created_at: new Date('2023-01-01T00:00:00Z'),
        },
        {
          id: '2',
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          phone: '0987654321',
          is_active: false,
          created_at: new Date('2023-01-02T00:00:00Z'),
        },
      ];
      const total = 2;

      mockUserRepository.findAndCount.mockResolvedValueOnce([users, total]);

      const result = await service.getUsersByAdmin(page, limit, superAdminPayload);

      expect(result).toEqual({
        status: 'success',
        message: 'Users retrieved successfully',
        data: {
          users: users.map(user => ({
            id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            phone_number: user.phone,
            is_active: user.is_active,
            created_at: user.created_at,
          })),
          pagination: {
            current_page: page,
            total_pages: 1,
            total_users: total,
          },
        },
      });
      expect(mockUserRepository.findAndCount).toHaveBeenCalledWith({
        select: ['id', 'first_name', 'last_name', 'email', 'phone', 'is_active', 'created_at'],
        skip: 0,
        take: limit,
        order: { created_at: 'DESC' },
      });
    });

    it('should throw ForbiddenException when called by non-super admin', async () => {
      await expect(service.getUsersByAdmin(page, limit, regularUserPayload)).rejects.toThrow(ForbiddenException);
      expect(mockUserRepository.findAndCount).not.toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      const users = Array(15)
        .fill(null)
        .map((_, index) => ({
          id: `${index + 1}`,
          first_name: `User${index + 1}`,
          last_name: 'Test',
          email: `user${index + 1}@example.com`,
          phone: `123456789${index}`,
          is_active: true,
          created_at: new Date(2023, 0, index + 1),
        }));
      const total = 15;

      mockUserRepository.findAndCount.mockResolvedValueOnce([users.slice(0, 10), total]);

      const result = await service.getUsersByAdmin(page, limit, superAdminPayload);

      expect(result.data.pagination).toEqual({
        current_page: page,
        total_pages: 2,
        total_users: total,
      });
      expect(result.data.users.length).toBe(10);
      expect(result.data.users[0]).toEqual({
        id: '1',
        name: 'User1 Test',
        email: 'user1@example.com',
        phone_number: '1234567890',
        is_active: true,
        created_at: expect.any(Date),
      });
    });

    it('should handle empty result', async () => {
      mockUserRepository.findAndCount.mockResolvedValueOnce([[], 0]);

      const result = await service.getUsersByAdmin(page, limit, superAdminPayload);

      expect(result).toEqual({
        status: 'success',
        message: 'Users retrieved successfully',
        data: {
          users: [],
          pagination: {
            current_page: page,
            total_pages: 0,
            total_users: 0,
          },
        },
      });
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      const userId = '1';
      const authenticatedUserId = '1';
      const userToDelete = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'hashedpassword',
        is_active: true,
        attempts_left: 3,
        time_left: 60,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userToDelete);
      mockUserRepository.softDelete.mockResolvedValueOnce({ affected: 1 });

      const result = await service.softDeleteUser(userId, authenticatedUserId);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Deletion in progress');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user is not found', async () => {
      const userId = '1';
      const authenticatedUserId = '1';

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.softDeleteUser(userId, authenticatedUserId)).rejects.toHaveProperty('response', {
        error: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not authorized to delete the user', async () => {
      const userId = '1';
      const authenticatedUserId = '2';
      const userToDelete = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'hashedpassword',
        is_active: true,
        attempts_left: 3,
        time_left: 60,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userToDelete);

      await expect(service.softDeleteUser(userId, authenticatedUserId)).rejects.toHaveProperty('response', {
        status: 'error',
        message: 'You are not authorized to delete this user',
        status_code: 401,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('softDeleteUser', () => {
    it('should soft delete a user', async () => {
      const userId = '1';
      const authenticatedUserId = '1';
      const userToDelete = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'hashedpassword',
        is_active: true,
        attempts_left: 3,
        time_left: 60,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userToDelete);
      mockUserRepository.softDelete.mockResolvedValueOnce({ affected: 1 });

      const result = await service.softDeleteUser(userId, authenticatedUserId);

      expect(result.status).toBe('success');
      expect(result.message).toBe('Deletion in progress');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if user is not found', async () => {
      const userId = '1';
      const authenticatedUserId = '1';

      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.softDeleteUser(userId, authenticatedUserId)).rejects.toHaveProperty('response', {
        error: 'Not Found',
        message: 'User not found',
        statusCode: 404,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not authorized to delete the user', async () => {
      const userId = '1';
      const authenticatedUserId = '2';
      const userToDelete = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'test@example.com',
        password: 'hashedpassword',
        is_active: true,
        attempts_left: 3,
        time_left: 60,
      };

      mockUserRepository.findOne.mockResolvedValueOnce(userToDelete);

      await expect(service.softDeleteUser(userId, authenticatedUserId)).rejects.toHaveProperty('response', {
        status: 'error',
        message: 'You are not authorized to delete this user',
        status_code: 401,
      });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['profile', 'organisationMembers', 'created_organisations', 'owned_organisations'],
      });
      expect(mockUserRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
