import { HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
jest.mock('uuid');

describe('InviteService', () => {
  let service: InviteService;
  let repository: Repository<Invite>;
  let organisationRepo: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        {
          provide: getRepositoryToken(Invite),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    repository = module.get<Repository<Invite>>(getRepositoryToken(Invite));
    organisationRepo = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should fetch all invites', async () => {
    const mockUser: User = {
      email: 'tester@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      phone: '+1234567890',
      id: 'some-uuid-value-here',
      attempts_left: 2,
      created_at: new Date(),
      updated_at: new Date(),
      user_type: UserType.ADMIN,
      owned_organisations: [],
      created_organisations: [],
      invites: [],
      jobs: [],
      hashPassword: () => null,
      password: 'password123',
      time_left: 5,
      secret: 'secret',
      is_2fa_enabled: true,
      backup_codes_2fa: null,
      totp_code: 28282828,
      encryptBackupCodes: async () => {},
      testimonials: [],
      profile: null,
      organisationMembers: [],
      notifications: [],
    };

    const mockOrg: Organisation = {
      id: 'some-random-id',
      created_at: new Date(),
      updated_at: new Date(),
      name: 'Org 1',
      description: 'Description 1',
      email: 'test1@email.com',
      industry: 'industry1',
      type: 'type1',
      country: 'country1',
      address: 'address1',
      state: 'state1',
      isDeleted: false,
      owner: mockUser,
      creator: mockUser,
      preferences: [],
      invites: [],
      organisationMembers: [],
      products: [],
    };
    const mockInvites: Invite[] = [
      {
        id: '1',
        email: 'user1@example.com',
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        organisation: mockOrg,
        user: mockUser,
      },
      {
        id: '2',
        email: 'user2@example.com',
        status: 'approved',
        created_at: new Date(),
        updated_at: new Date(),
        organisation: mockOrg,
        user: mockUser,
      },
    ];

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
});
