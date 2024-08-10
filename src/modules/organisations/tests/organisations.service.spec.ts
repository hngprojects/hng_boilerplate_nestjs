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
import { organisationMembersMocks } from './mocks/organisation-members.mock';
import { OrganisationUserRole } from '../../../modules/role/entities/organisation-user-role.entity';
import { Role } from '../../../modules/role/entities/role.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;
  let permisssionsRepository: Repository<Permissions>;
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
            save: jest.fn(),
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
      const superAdminRole = { id: 'role-id', name: 'super_admin', description: '', permissions: [] };
      const newOrganisation = { ...createOrganisationDto, id: 'org-id', owner: user };
      const adminReponse = {
        id: 'some-id',
        userId,
        roleId: 'role-id',
        organisationId: 'org-id',
      } as OrganisationUserRole;

      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user as User);
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(superAdminRole as Role);
      jest.spyOn(organisationRepository, 'save').mockResolvedValue(newOrganisation as Organisation);
      jest.spyOn(organisationUserRole, 'save').mockResolvedValue(adminReponse);

      const result = await service.create(createOrganisationDto, userId);

      expect(result).toEqual(
        expect.objectContaining({
          id: 'org-id',
          name: 'Test Org',
          email: 'test@example.com',
          owner_id: 'user-id', // Matching the owner_id instead of nested owner object
        })
      );
    });
  });

  describe('update organisation', () => {
    it('should update an organisation successfully', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };
      const organisation = new Organisation();

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(organisation);
      jest.spyOn(organisationRepository, 'update').mockResolvedValue({} as any);
      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(organisationRepository, 'update').mockResolvedValueOnce({ affected: 1 } as any);
      jest
        .spyOn(organisationRepository, 'findOneBy')
        .mockResolvedValueOnce({ ...organisation, ...updateOrganisationDto });

      const result = await service.updateOrganisation(id, updateOrganisationDto);

      expect(result.message).toEqual('Organisation updated successfully');
      expect(result.data).toBeDefined();
    });

    it('should throw CustomHttpException if organisation not found', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.updateOrganisation(id, updateOrganisationDto)).rejects.toThrow(CustomHttpException);
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

      const mockOrganisationUserRole = {
        orgId: 'new-org',
        roleId: 'role-id',
        userId: 'user-id',
        user: { id: 'user-id' } as User,
      };

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);
      organisationUserRole.find = jest.fn().mockResolvedValue([mockOrganisationUserRole]);

      await expect(service.getOrganisationMembers('orgId', 1, 10, 'sub')).rejects.toThrow(ForbiddenException);
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
});
