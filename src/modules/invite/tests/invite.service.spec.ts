import { BadRequestException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { User } from '../../user/entities/user.entity';
import { Invite } from '../entities/invite.entity';
import { InviteService } from '../invite.service';
import { v4 as uuidv4 } from 'uuid';
import { mockInvitesResponse } from '../mocks/mockInvitesReponse';
import { mockInvites } from '../mocks/mockInvites';
import { mockOrg } from '../mocks/mockOrg';
import { OrganisationMember } from '../../../modules/organisations/entities/org-members.entity';
import { OrganisationRole } from '../../../modules/organisation-role/entities/organisation-role.entity';
import { DefaultRole } from '../../../modules/organisation-role/entities/role.entity';
import { DefaultPermissions } from '../../../modules/organisation-permissions/entities/default-permissions.entity';
import { Permissions } from '../../../modules/organisation-permissions/entities/permissions.entity';
import { OrganisationsService } from '../../../modules/organisations/organisations.service';
import { mockUser } from '../mocks/mockUser';
import { orgMemberMock } from '../../../modules/organisations/tests/mocks/organisation-member.mock';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
jest.mock('uuid');

describe('InviteService', () => {
  let service: InviteService;
  let repository: Repository<Invite>;
  let organisationRepo: Repository<Organisation>;
  let userRepository: Repository<User>;
  let organisationService: OrganisationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        OrganisationsService,
        {
          provide: getRepositoryToken(Invite),
          useValue: {
            find: jest.fn(),
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
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
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: OrganisationsService,
          useValue: {
            addOrganisationMember: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    repository = module.get<Repository<Invite>>(getRepositoryToken(Invite));
    organisationRepo = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    service = module.get<InviteService>(InviteService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organisationService = module.get<OrganisationsService>(OrganisationsService);
  });

  it('should fetch all invites', async () => {
    jest.spyOn(repository, 'find').mockResolvedValue(mockInvites);

    const result = await service.findAllInvitations();

    expect(result).toEqual({
      status_code: 200,
      message: 'Successfully fetched invites',
      data: mockInvitesResponse,
    });
  });

  it('should throw an internal server error if an exception occurs', async () => {
    jest.spyOn(repository, 'find').mockRejectedValue(new Error('Test error'));

    await expect(service.findAllInvitations()).rejects.toThrow(InternalServerErrorException);
  });

  describe('createInvite', () => {
    it('should create an invite and return a link', async () => {
      const mockToken = 'mock-uuid';
      const mockInvites = { id: '1', token: mockToken };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(mockOrg as Organisation);
      jest.spyOn(repository, 'create').mockReturnValue(mockInvites as Invite);
      jest.spyOn(repository, 'save').mockResolvedValue(mockInvites as Invite);
      (uuidv4 as jest.Mock).mockReturnValue(mockToken);

      const result = await service.createInvite('1');

      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Invite link generated successfully',
        link: `${process.env.FRONTEND_URL}/invite?token=${mockToken}`,
      });

      expect(organisationRepo.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.create).toHaveBeenCalledWith({
        token: mockToken,
        organisation: mockOrg,
        isGeneric: true,
      });
      expect(repository.save).toHaveBeenCalledWith(mockInvites);
    });

    it('should throw NotFoundException if organisation is not found', async () => {
      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(null);

      await expect(service.createInvite('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('Accept Invite Service', () => {
    it('should accept a valid invite', async () => {
      const mockInvite = {
        id: 'some-id',
        token: 'valid-token',
        email: 'test@example.com',
        isGeneric: false,
        isAccepted: false,
        organisation: orgMock,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(organisationService, 'addOrganisationMember')
        .mockResolvedValue({ status: 'success', message: 'Member added', member: orgMemberMock });

      const result = await service.acceptInvite({ token: 'valid-token', email: 'test@example.com' });

      expect(result).toEqual({ status: 'success', message: 'Member added', member: orgMemberMock });
      expect(repository.save).toHaveBeenCalledWith({ ...mockInvite, isAccepted: true });
    });

    it('should throw NotFoundException if invite not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.acceptInvite({ token: 'invalid-token', email: 'test@example.com' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if email does not match non-generic invite', async () => {
      const mockInvite = {
        id: 'some-id',
        token: 'valid-token',
        email: 'test@example.com',
        isGeneric: false,
        isAccepted: true,
        organisation: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);

      await expect(service.acceptInvite({ token: 'valid-token', email: 'wrong@example.com' })).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException if invite already accepted', async () => {
      const mockInvite = {
        id: 'some-id',
        token: 'valid-token',
        email: 'test@example.com',
        isGeneric: false,
        isAccepted: true,
        organisation: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);

      await expect(service.acceptInvite({ token: 'valid-token', email: 'test@example.com' })).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.acceptInvite({ token: 'valid-token', email: 'test@example.com' })).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw InternalServerErrorException if adding member fails', async () => {
      const mockInvite = {
        id: 'some-id',
        token: 'valid-token',
        email: 'test@example.com',
        isGeneric: false,
        isAccepted: false,
        organisation: orgMock,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(organisationService, 'addOrganisationMember')
        .mockResolvedValue({ status: 'error', message: 'Member added', member: orgMemberMock });

      await expect(service.acceptInvite({ token: 'valid-token', email: 'test@example.com' })).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
