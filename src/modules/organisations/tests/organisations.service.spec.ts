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
import { newUser } from './mocks/new-user.mock';
import {
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  HttpStatus,
} from '@nestjs/common';
import { Profile } from '../../profile/entities/profile.entity';
import { OrganisationMember } from '../entities/org-members.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as SYS_MSG from '../../../helpers/SystemMessages';

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
            save: jest.fn(),
            delete: jest.fn(),
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
      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...orgMock.owner,
      } as User);
      jest.spyOn(organisationRepository, 'create').mockReturnValue(orgMock);
      jest.spyOn(organisationRepository, 'save').mockResolvedValue({
        ...orgMock,
      });

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

  describe('it should validate before removing a user', () => {
    const member = orgMock.organisationMembers[0].user_id.id;

    it("should throw error if organisation doesn't exist", async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeMember(orgMock.owner.id, newUser.id)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.ORG_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it("should throw error if user doesn't exist", async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);

      await expect(service.removeMember(orgMock.id, member)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.USER_NOT_FOUND, HttpStatus.NOT_FOUND)
      );
    });

    it('should successfully remove user', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(orgMock.organisationMembers[0].user_id);

      const result = await service.removeMember(orgMock.id, member);

      expect(result.status).toEqual('success');
      expect(result.message).toEqual('Member was removed successfully');
      expect(result.status_code).toEqual(200);
    });

    it('should throw an error if the specified user is not a member', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(newUser);

      await expect(service.removeMember(orgMock.id, member)).rejects.toThrow(
        new CustomHttpException(SYS_MSG.NOT_A_MEMBER, HttpStatus.FORBIDDEN)
      );
    });
  });
});
