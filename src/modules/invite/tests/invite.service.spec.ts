import { InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { User, UserType } from '../../user/entities/user.entity';
import { Invite } from '../entities/invite.entity';
import { InviteService } from '../invite.service';
import { Notification } from '../../notifications/entities/notification.entity';

describe('InviteService', () => {
  let service: InviteService;
  let repository: Repository<Invite>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InviteService,
        {
          provide: getRepositoryToken(Invite),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    repository = module.get<Repository<Invite>>(getRepositoryToken(Invite));
  });

  it('should fetch all invites', async () => {
    const mockUser: User = {
      email: 'tester@example.com',
      first_name: 'John',
      last_name: 'Doe',
      is_active: true,
      id: 'some-uuid-value-here',
      attempts_left: 2,
      created_at: new Date(),
      updated_at: new Date(),
      user_type: UserType.ADMIN,
      owned_organisations: [],
      created_organisations: [],
      invites: [],
      hashPassword: () => null,
      password: 'password123',
      time_left: 5,
      secret: 'secret',
      is_2fa_enabled: true,
      testimonials: [],
      notifications: [] as Notification[],
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
      data: mockInvites.map(invite => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
      })),
    });
  });

  it('should throw an internal server error if an exception occurs', async () => {
    jest.spyOn(repository, 'find').mockRejectedValue(new Error('Test error'));

    await expect(service.findAllInvitations()).rejects.toThrow(InternalServerErrorException);
  });
});
