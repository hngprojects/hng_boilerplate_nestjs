import { Test, TestingModule } from '@nestjs/testing';
import { InviteService } from '../invite.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Invite } from '../entities/invite.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { User } from '@modules/user/entities/user.entity';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailService } from '@modules/email/email.service';
import { ConfigService } from '@nestjs/config';
import { OrganisationsService } from '@modules/organisations/organisations.service';
import { Repository, EntityManager } from 'typeorm';

describe('InviteService', () => {
  let service: InviteService;
  let inviteRepository: jest.Mocked<Repository<Invite>>;

  const mockInviteRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockOrganisationRepository = {
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockMailerService = {
    sendMail: jest.fn(),
  };

  const mockEmailService = {
    getTemplate: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockOrganisationsService = {
    addOrganisationMember: jest.fn(),
  };

  // Add a mock for EntityManager
  const mockEntityManager = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        { provide: getRepositoryToken(Invite), useValue: mockInviteRepository },
        { provide: getRepositoryToken(Organisation), useValue: mockOrganisationRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: MailerService, useValue: mockMailerService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OrganisationsService, useValue: mockOrganisationsService },
        { provide: EntityManager, useValue: mockEntityManager }, // Add this line
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    inviteRepository = module.get(getRepositoryToken(Invite));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllInvitations', () => {
    it('should return paginated invitations with default parameters', async () => {
      const mockInvites = [
        {
          id: '1',
          token: 'token1',
          isAccepted: false,
          isGeneric: true,
          organisation: { id: 'org1', name: 'Org 1' },
          email: 'test1@example.com',
        },
      ];

      mockInviteRepository.findAndCount.mockResolvedValue([mockInvites, 1]);

      const result = await service.findAllInvitations();

      expect(mockInviteRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        status: 'success',
        status_code: HttpStatus.OK,
        message: 'Invitations retrieved successfully',
        data: {
          invitations: expect.any(Array),
          total: 1,
        },
      });
      expect(result.data.invitations).toHaveLength(1);
    });

    it('should return paginated invitations with custom parameters', async () => {
      const mockInvites = [
        {
          id: '1',
          token: 'token1',
          isAccepted: false,
          isGeneric: true,
          organisation: { id: 'org1', name: 'Org 1' },
          email: 'test1@example.com',
        },
        {
          id: '2',
          token: 'token2',
          isAccepted: true,
          isGeneric: false,
          organisation: { id: 'org2', name: 'Org 2' },
          email: 'test2@example.com',
        },
      ];

      mockInviteRepository.findAndCount.mockResolvedValue([mockInvites, 10]);

      const result = await service.findAllInvitations(2, 5);

      expect(mockInviteRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
      });

      expect(result).toEqual({
        status: 'success',
        status_code: HttpStatus.OK,
        message: 'Invitations retrieved successfully',
        data: {
          invitations: expect.any(Array),
          total: 10,
        },
      });
      expect(result.data.invitations).toHaveLength(2);
    });

    it('should handle errors and throw InternalServerErrorException', async () => {
      mockInviteRepository.findAndCount.mockRejectedValue(new Error('Database error'));

      await expect(service.findAllInvitations()).rejects.toThrow(InternalServerErrorException);
    });
  });
});
