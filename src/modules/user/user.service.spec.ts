import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { JwtModule } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
// import dataSource from '../../database/data-source';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
      imports: [
        // TypeOrmModule.forRootAsync({
        //   useFactory: async () => ({
        //     ...dataSource.options,
        //   }),
        //   dataSourceFactory: async () => dataSource,
        // }),
        JwtModule.register({
          secret: process.env.JWT_SECRET, // Use environment variables for security
          signOptions: { expiresIn: '60m' }, // Token expiration time
        }),
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  }, 100000);

  it('should return user details if user is found and in the same organisation', async () => {
    const userId = 'user-id';
    const userDetails = { id: 'authenticated-user-id' };

    const user = {
      id: userId,
      email: 'user@example.com',
      organisations: [{ org_id: 'org-1' }],
    } as User;

    const authenticatedUser = {
      id: userDetails.id,
      email: 'auth-user@example.com',
      organisations: [{ org_id: 'org-1' }],
    } as User;

    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(authenticatedUser);

    const result = await service.findOne(userId, userDetails);
    expect(result).toEqual({
      id: user.id,
      email: user.email,
    });
  }, 10000);

  it('should throw NotFoundException if user is not found', async () => {
    const userId = 'non-existing-id';
    const userDetails = { id: 'authenticated-user-id' };

    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(null);

    await expect(service.findOne(userId, userDetails)).rejects.toThrow(NotFoundException);
  }, 10000);

  it('should throw ForbiddenException if no common organisations are found', async () => {
    const userId = 'user-id';
    const userDetails = { id: 'authenticated-user-id' };

    const user = {
      id: userId,
      email: 'user@example.com',
      organisations: [{ org_id: 'org-2' }],
    } as User;

    const authenticatedUser = {
      id: userDetails.id,
      email: 'auth-user@example.com',
      organisations: [{ org_id: 'org-1' }],
    } as User;

    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);
    jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(authenticatedUser);

    await expect(service.findOne(userId, userDetails)).rejects.toThrow(ForbiddenException);
  }, 10000);
});
