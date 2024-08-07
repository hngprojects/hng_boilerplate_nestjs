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
  HttpStatus,
} from '@nestjs/common';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationMember } from '../entities/org-members.entity';
import { AddMemberDto } from '../dto/add-member.dto';
import { OrganisationRole } from '../../../modules/organisation-role/entities/organisation-role.entity';
import { DefaultRole } from '../../../modules/organisation-role/entities/role.entity';
import { DefaultPermissions } from '../../../modules/organisation-permissions/entities/default-permissions.entity';
import { mockUser } from './mocks/user.mock';
import { orgMemberMock } from './mocks/organisation-member.mock';
import { organisationRoleMock } from './mocks/organisation-role.mock';
import { defaultOrganisationRoleMocks } from './mocks/default-organisation-role.mock';
import { defaultOrganisationPermissionMocks } from './mocks/default-organisation-permission.mock';
import { Permissions } from '../../../modules/organisation-permissions/entities/permissions.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { ORG_MEMBER_DOES_NOT_BELONG, ORG_MEMBER_NOT_FOUND, ROLE_NOT_FOUND } from '../../../helpers/SystemMessages';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;
  let organisationRoleRepository: Repository<OrganisationRole>;
  let defaultRoleRepository: Repository<DefaultRole>;
  let defaultPermisssionsRepository: Repository<DefaultPermissions>;
  let permisssionsRepository: Repository<Permissions>;
  let profileRepository: Repository<Profile>;
  let organisationMemberRepository: Repository<OrganisationMember>;
  let rolesRepository: Repository<OrganisationRole>;

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
        {
          provide: getRepositoryToken(OrganisationRole),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DefaultRole),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DefaultPermissions),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permissions),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrganisationMember),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OrganisationRole),
          useValue: {
            findOne: jest.fn(),
            findBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
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
    organisationRoleRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    defaultRoleRepository = module.get<Repository<DefaultRole>>(getRepositoryToken(DefaultRole));
    defaultPermisssionsRepository = module.get<Repository<DefaultPermissions>>(getRepositoryToken(DefaultPermissions));
    permisssionsRepository = module.get<Repository<Permissions>>(getRepositoryToken(Permissions));
    organisationMemberRepository = module.get<Repository<OrganisationMember>>(getRepositoryToken(OrganisationMember));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    rolesRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create organisation', () => {
    beforeEach(async () => {
      const errors = await validate(createMockOrganisationRequestDto());
      expect(errors).toHaveLength(0);
    });

    it('should create an organisation', async () => {
      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...orgMock.owner,
      } as User);
      jest.spyOn(organisationRepository, 'create').mockReturnValue(orgMock);
      jest.spyOn(organisationRepository, 'save').mockResolvedValue({
        ...orgMock,
      });
      jest.spyOn(defaultRoleRepository, 'find').mockResolvedValue(Promise.resolve(defaultOrganisationRoleMocks));
      jest
        .spyOn(defaultPermisssionsRepository, 'find')
        .mockResolvedValue(Promise.resolve(defaultOrganisationPermissionMocks));
      jest.spyOn(organisationRoleRepository, 'create').mockReturnValue(organisationRoleMock);
      jest.spyOn(organisationRoleRepository, 'save').mockResolvedValue(organisationRoleMock);

      const result = await service.create(createMockOrganisationRequestDto(), orgMock.owner.id);
      expect(result.status).toEqual('success');
      expect(result.message).toEqual('organisation created successfully');
    });

    it('should throw an error if the email already exists', async () => {
      organisationRepository.findBy = jest.fn().mockResolvedValue([orgMock]);
      await expect(service.create(createMockOrganisationRequestDto(), orgMock.owner.id)).rejects.toThrow(
        new ConflictException('Organisation with this email already exists')
      );
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

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const orgId = 'orgId';
      const memberId = '1';
      const updateMemberRoleDto = { role: 'newRole' };
      const mockMember = {
        id: memberId,
        user_id: { id: 'userId', first_name: 'John', last_name: 'Doe' },
        organisation_id: { id: orgId },
        role: { name: 'oldRole' },
      };
      const mockNewRole = { name: 'newRole' };

      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(mockMember as OrganisationMember);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(mockNewRole as OrganisationRole);
      jest
        .spyOn(organisationMemberRepository, 'save')
        .mockResolvedValue({ ...mockMember, role: mockNewRole } as OrganisationMember);

      const result = await service.updateMemberRole(orgId, memberId, updateMemberRoleDto);

      expect(result).toEqual({
        message: 'John Doe has successfully been added to the newRole role',
        status_code: 201,
        data: {
          user: mockMember.user_id,
          org: mockMember.organisation_id,
          role: mockNewRole,
        },
      });
    });

    it('should throw CustomHttpException if member is not found', async () => {
      const orgId = 'orgId';
      const memberId = '1';
      const updateMemberRoleDto = { role: 'newRole' };

      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateMemberRole(orgId, memberId, updateMemberRoleDto)).rejects.toThrow(
        new CustomHttpException(ORG_MEMBER_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should throw CustomHttpException if member does not belong to the specified organisation', async () => {
      const orgId = 'orgId';
      const memberId = '1';
      const updateMemberRoleDto = { role: 'newRole' };
      const mockMember = {
        id: memberId,
        user_id: { id: 'userId' },
        organisation_id: { id: 'differentOrgId' },
        role: { name: 'oldRole' },
      };

      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(mockMember as OrganisationMember);

      await expect(service.updateMemberRole(orgId, memberId, updateMemberRoleDto)).rejects.toThrow(
        new CustomHttpException(ORG_MEMBER_DOES_NOT_BELONG, HttpStatus.FORBIDDEN)
      );
    });

    it('should throw CustomHttpException if role is not found in the organization', async () => {
      const orgId = 'orgId';
      const memberId = '1';
      const updateMemberRoleDto = { role: 'newRole' };
      const mockMember = {
        id: memberId,
        user_id: { id: 'userId' },
        organisation_id: { id: orgId },
        role: { name: 'oldRole' },
      };

      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(mockMember as OrganisationMember);
      jest.spyOn(rolesRepository, 'findOne').mockResolvedValue(null);

      await expect(service.updateMemberRole(orgId, memberId, updateMemberRoleDto)).rejects.toThrow(
        new CustomHttpException(ROLE_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });
  });

  describe('addOrganisationMember', () => {
    it('should add a new member to the organisation', async () => {
      const addMemberDto: AddMemberDto = { user_id: 'user1234' };

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValue(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(organisationRoleRepository, 'findOne').mockResolvedValue(organisationRoleMock);
      jest.spyOn(organisationMemberRepository, 'create').mockReturnValue(orgMemberMock);
      jest.spyOn(organisationMemberRepository, 'save').mockResolvedValue(orgMemberMock);

      const result = await service.addOrganisationMember(orgMock.id, addMemberDto);

      expect(result).toEqual({
        status: 'success',
        message: 'Member added successfully',
        member: orgMemberMock,
      });
    });

    it('should throw NotFoundException if organisation is not found', async () => {
      const addMemberDto: AddMemberDto = { user_id: 'user123' };

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.addOrganisationMember(orgMock.id, addMemberDto)).rejects.toThrow(CustomHttpException);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const addMemberDto: AddMemberDto = { user_id: 'nonexistent' };

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addOrganisationMember(orgMock.id, addMemberDto)).rejects.toThrow(CustomHttpException);
    });

    it('should throw ConflictException if user is already a member', async () => {
      const addMemberDto: AddMemberDto = { user_id: 'user123' };

      const organisation = new Organisation();
      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(orgMemberMock);

      await expect(service.addOrganisationMember(orgMock.id, addMemberDto)).rejects.toThrow(CustomHttpException);
    });
  });
});
