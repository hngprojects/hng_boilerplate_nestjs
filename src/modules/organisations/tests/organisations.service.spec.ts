import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsService } from '../organisations.service';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { orgMock } from '../tests/mocks/organisation.mock';
import { createMockOrganisationRequestDto } from '../tests/mocks/organisation-dto.mock';
import UserService from '../../user/user.service';
import { InternalServerErrorException, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationMember } from '../entities/org-members.entity';
import { organisationMembersMocks } from './mocks/organisation-members.mock';
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
            findBy: jest.fn(),
            findOne: jest.fn(),
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
      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue([]);
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
      jest.spyOn(organisationRepository, 'update').mockResolvedValueOnce({ affected: 1 } as UpdateResult);
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

  describe('search organisation members', () => {
    const orgMembers = [...organisationMembersMocks];

    it('should verify that filtered request returns accurate data', async () => {
      const generateMemberResponseFormat = member => ({
        user_id: member.user_id.id,
        username: member.profile_id.username,
        email: member.user_id.email,
        name: `${member.user_id.first_name} ${member.user_id.last_name}`,
        phone_number: member.user_id.phone,
        profile_pic_url: member.profile_id.profile_pic_url,
      });

      jest.spyOn(organisationMemberRepository, 'find').mockResolvedValue([...orgMembers]);
      const result = await service.searchOrganisationMember('some-org-uuid', 'Alice Johnson', 'suspended');
      const result2 = await service.searchOrganisationMember('some-org-uuid', 'Jan', 'active_member');
      const result3 = await service.searchOrganisationMember('some-org-uuid', 'bolu', 'left_workspace');

      const expectedMembers1 = [{ ...orgMembers[2] }].map(generateMemberResponseFormat);
      const expectedMembers2 = [{ ...orgMembers[0] }, { ...orgMembers[4] }].map(generateMemberResponseFormat);
      const expectedMembers3 = [{ ...orgMembers[1] }, { ...orgMembers[3] }].map(generateMemberResponseFormat);

      expect(result.data.members).toEqual(expectedMembers1);
      expect(result2.data.members).toEqual(expectedMembers2);
      expect(result3.data.members).toEqual(expectedMembers3);
    });

    it('should return an empty array for members when no members are found', async () => {
      jest.spyOn(organisationMemberRepository, 'find').mockResolvedValue([...orgMembers]);

      const result = await service.searchOrganisationMember('some-org-uuid', 'JamesBondIsGood', 'active_member');

      expect(result).toEqual({ message: 'User(s) found successfully', data: { members: [] } });
    });
  });

  describe('removeOrganisationMember', () => {
    it('should throw CustomHttpException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.removeOrganisationMember({
          organisationId: 'org-id',
          userId: 'user-id',
        } as any)
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw CustomHttpException if organisation is not found', async () => {
      const user: any = {
        id: 'some-uuid-here',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.removeOrganisationMember({
          organisationId: 'org-id',
          userId: 'user-id',
        } as any)
      ).rejects.toThrow(CustomHttpException);
    });

    it('should throw CustomHttpException if organisation member is not found', async () => {
      const user: any = {
        id: 'some-uuid-here',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({
        id: 'org-id',
        organisationMembers: [],
      } as Organisation);

      await expect(
        service.removeOrganisationMember({
          organisationId: 'org-id',
          userId: 'user-id',
        } as any)
      ).rejects.toThrow(CustomHttpException);
    });

    it('should remove an organisation member successfully', async () => {
      const user: any = {
        id: 'some-uuid-here',
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      const organisation = {
        id: 'org-id',
        organisationMembers: [{ user_id: { id: 'user-id' } }],
      } as any;

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation);
      jest.spyOn(organisationMemberRepository, 'findOne').mockResolvedValue(organisation.organisationMembers[0]);
      jest.spyOn(organisationMemberRepository, 'softDelete').mockResolvedValue({ affected: 1 } as UpdateResult);

      const result = await service.removeOrganisationMember({
        organisationId: 'org-id',
        userId: 'user-id',
      } as any);

      expect(result).toEqual({
        message: 'Member removed from organisation successfully',
      });
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
