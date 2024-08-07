import { HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

  describe('refreshInvite', () => {
    it('should refresh an invitation link successfully', async () => {
      const orgId = uuidv4();
      const inviteId = uuidv4();
      const organisation = { id: orgId };
      const invitation = { id: inviteId, isAccepted: false };
      const newToken = uuidv4();
      const updatedInvitation = { ...invitation, token: newToken };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(organisation as any);
      jest.spyOn(repository, 'findOne').mockResolvedValue(invitation as any);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedInvitation as any);
      (uuidv4 as jest.Mock).mockReturnValue(newToken);

      const result = await service.refreshInvite(orgId, inviteId);

      expect(result).toHaveProperty('data');
    });

    it('should throw an exception if the organisation does not exist', async () => {
      const orgId = uuidv4();
      const inviteId = uuidv4();

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(null);

      await expect(service.refreshInvite(orgId, inviteId)).rejects.toThrow(HttpException);
    });

    it('should throw an exception if the invitation does not exist', async () => {
      const orgId = uuidv4();
      const inviteId = uuidv4();
      const organisation = { id: orgId };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(organisation as any);
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.refreshInvite(orgId, inviteId)).rejects.toThrow(HttpException);
    });

    it('should throw an exception if the invitation has already been accepted', async () => {
      const orgId = uuidv4();
      const inviteId = uuidv4();
      const organisation = { id: orgId };
      const invitation = { id: inviteId, isAccepted: true };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(organisation as any);
      jest.spyOn(repository, 'findOne').mockResolvedValue(invitation as any);

      await expect(service.refreshInvite(orgId, inviteId)).rejects.toThrow(HttpException);
    });
  });
});
