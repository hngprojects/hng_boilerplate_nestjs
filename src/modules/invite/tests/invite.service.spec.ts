import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { User, UserType } from '../../user/entities/user.entity';
import { Invite } from '../entities/invite.entity';
import { InviteService } from '../invite.service';

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
      jobs: [],
      hashPassword: () => null,
      password: 'password123',
      time_left: 5,
      secret: 'secret',
      is_2fa_enabled: true,
      testimonials: [],
      profile: null,
      organisationMembers: [],
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
        created_at: new Date(),
        updated_at: new Date(),
        token: 'url',
        organisation: mockOrg,
        email: 'string',
        isGeneric: true,
        isAccepted: true,
      },
      {
        id: '2',
        created_at: new Date(),
        updated_at: new Date(),
        token: 'url',
        organisation: mockOrg,
        email: 'string',
        isGeneric: true,
        isAccepted: true,
      },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(mockInvites);

    const result = await service.findAllInvitations();

    expect(result).toEqual({
      status_code: 200,
      message: 'Successfully fetched invites',
      data: mockInvites,
    });
  });

  it('should throw an internal server error if an exception occurs', async () => {
    jest.spyOn(repository, 'find').mockRejectedValue(new Error('Test error'));

    await expect(service.findAllInvitations()).rejects.toThrow(InternalServerErrorException);
  });
});
