import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsService } from '../organisations.service';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { orgMock } from '../tests/mocks/organisation.mock';
import { createMockOrganisationRequestDto } from '../tests/mocks/organisation-dto.mock';
import UserService from '../../user/user.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationUserRole } from '../../../modules/role/entities/organisation-user-role.entity';
import { Role } from '../../../modules/role/entities/role.entity';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;
  let profileRepository: Repository<Profile>;
  let organisationUserRole: Repository<OrganisationUserRole>;
  let roleRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsService,
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },

        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrganisationUserRole),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    organisationUserRole = module.get(getRepositoryToken(OrganisationUserRole));
    roleRepository = module.get(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create', () => {
    it('should create a new organisation', async () => {
      const createOrganisationDto = { name: 'Test Org', email: 'test@example.com' };
      const userId = 'user-id';
      const user = { id: userId };
      const superAdminRole = { id: 'role-id', name: 'super_admin' };
      const newOrganisation = { ...createOrganisationDto, id: 'org-id', owner: user };

      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue([]);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(superAdminRole as Role);
      jest.spyOn(organisationRepository, 'save').mockResolvedValue(newOrganisation as Organisation);
      jest.spyOn(organisationUserRole, 'save').mockResolvedValue(undefined);

      const result = await service.create(createOrganisationDto, userId);

      expect(result.status).toEqual('success');
      expect(result.message).toEqual('organisation created successfully');
      expect(result.data).toEqual(newOrganisation);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createOrganisationDto = { name: 'Test Org', email: 'test@example.com' };

      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue([]);

      await expect(service.create(createOrganisationDto, 'user-id')).rejects.toThrow(ConflictException);
    });
  });

  describe('update organisation', () => {
    it('should update an organisation successfully', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };
      const organisation = new Organisation();

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(organisationRepository, 'update').mockResolvedValueOnce({ affected: 1 } as any);
      jest
        .spyOn(organisationRepository, 'findOneBy')
        .mockResolvedValueOnce({ ...organisation, ...updateOrganisationDto });

      const result = await service.updateOrganisation(id, updateOrganisationDto);

      expect(result).toEqual({
        message: 'Organisation successfully updated',
        org: { ...organisation, ...updateOrganisationDto },
      });
    });

    it('should throw NotFoundException if organisation not found', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.updateOrganisation(id, updateOrganisationDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(organisationRepository, 'findOneBy').mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.updateOrganisation(id, updateOrganisationDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getOrganisationMembers', () => {
    it('should throw NotFoundException if organisation is not found', async () => {
      organisationRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getOrganisationMembers('orgId', 1, 2, 'testUserId')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user is not a member', async () => {
      const mockOrganisation = {
        id: 'orgId',
        organisationMembers: [
          {
            user_id: { id: 'anotherUserId' },
          },
        ],
      } as unknown as Organisation;

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);

      await expect(service.getOrganisationMembers('orgId', 1, 10, 'sub')).rejects.toThrow(ForbiddenException);
    });

    it('should return paginated members if the user is a member', async () => {
      const mockOrganisation = {
        id: 'orgId',
        organisationMembers: [
          { user_id: { id: 'sub', first_name: 'John', last_name: 'Doe', email: 'john@email.com', phone: '0000' } },
          {
            user_id: {
              id: 'anotherUserId',
              first_name: 'Jane',
              last_name: 'Doe',
              email: 'jane@email.com',
              phone: '1111',
            },
          },
        ],
      } as unknown as Organisation;

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);

      const result = await service.getOrganisationMembers('orgId', 1, 1, 'sub');

      expect(result.status_code).toBe(200);
      expect(result.data).toEqual([{ id: 'sub', name: 'John Doe', email: 'john@email.com', phone_number: '0000' }]);
    });

    it('should paginate members correctly', async () => {
      const mockOrganisation = {
        id: 'orgId',
        organisationMembers: [
          { user_id: { id: 'sub', first_name: 'John', last_name: 'Doe', email: 'john@email.com', phone: '0000' } },
          {
            user_id: {
              id: 'anotherUserId',
              first_name: 'Jane',
              last_name: 'Doe',
              email: 'jane@email.com',
              phone: '1111',
            },
          },
        ],
      } as unknown as Organisation;

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);

      const result = await service.getOrganisationMembers('orgId', 2, 1, 'sub');

      expect(result.status_code).toBe(200);
      expect(result.data).toEqual([
        { id: 'anotherUserId', name: 'Jane Doe', email: 'jane@email.com', phone_number: '1111' },
      ]);
    });
  });
});
