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
import * as SYS_MSG from '../../../helpers/SystemMessages';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;
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
          provide: getRepositoryToken(OrganisationMember),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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
      } as Organisation);
      jest.spyOn(organisationMemberRepository, 'save').mockResolvedValue({
        user_id: { id: orgMock.owner.id },
        organisation_id: orgMock.id,
      } as any);

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
       
  
  describe("get user's organization", () => {
    it('should throw an error if the user has no organizations', async () => {
      const mockUser = new User();
      mockUser.id = 'sample-id-6789';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(organisationMemberRepository, 'find').mockResolvedValue(null);

      await expect(service.getUserOrganisations(mockUser.id)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.NO_USER_ORGS, HttpStatus.BAD_REQUEST)
      );
    });

    it('should return all the users organizations', async () => {
      const mockUser = orgMock.creator;
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(organisationMemberRepository, 'find').mockResolvedValue([
        {
          ...mockUser.organisationMembers[0],
          organisation_id: orgMock,
        },
      ]);

      const res = await service.getUserOrganisations(mockUser.id);

      expect(res.status_code).toEqual(HttpStatus.OK);
      expect(res.data).toHaveProperty('created_organisations');
      expect(res.data).toHaveProperty('owned_organisations');
      expect(res.data).toHaveProperty('member_organisations');
      expect(res.data.member_organisations[0]).toHaveProperty('role');
      expect(res.data.member_organisations[0]).toHaveProperty('organisation');
    });
  });
});
