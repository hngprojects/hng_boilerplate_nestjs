import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganisationMembersService } from '../services/org-members.service';
import { OrganisationMember } from '../entities/org-members.entity';
import { Organisation } from '../entities/organisations.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { orgMemberMock, createMockOrganisation } from './mocks/org-members.mock';

const mockOrganisationMembersRepository = {
  findOneOrFail: jest.fn(),
  remove: jest.fn(),
};

const mockOrganisationRepository = {
  findOneOrFail: jest.fn(),
};

describe('OrganisationMembersService', () => {
  let service: OrganisationMembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationMembersService,
        {
          provide: getRepositoryToken(OrganisationMember),
          useValue: mockOrganisationMembersRepository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: mockOrganisationRepository,
        },
      ],
    }).compile();

    service = module.get<OrganisationMembersService>(OrganisationMembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteOrganisationMember', () => {
    it('should delete an organisation member if user is owner', async () => {
      mockOrganisationMembersRepository.findOneOrFail.mockResolvedValue(orgMemberMock);
      mockOrganisationRepository.findOneOrFail.mockResolvedValue(orgMemberMock.organisation_id);

      await expect(
        service.deleteOrganisationMember(orgMemberMock.id, orgMemberMock.organisation_id.owner.id)
      ).resolves.not.toThrow();
      expect(mockOrganisationMembersRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: orgMemberMock.id },
        relations: ['organisation_id'],
      });
      expect(mockOrganisationRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: orgMemberMock.organisation_id.id },
        relations: ['owner'],
      });
      expect(mockOrganisationMembersRepository.remove).toHaveBeenCalledWith(orgMemberMock);
    });

    it('should throw NotFoundException if member not found', async () => {
      mockOrganisationMembersRepository.findOneOrFail.mockRejectedValue(new NotFoundException());

      await expect(
        service.deleteOrganisationMember(orgMemberMock.id, orgMemberMock.organisation_id.owner.id)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      const nonOwnerUser = { ...orgMemberMock.organisation_id.owner, id: 'non-owner-id' };
      mockOrganisationMembersRepository.findOneOrFail.mockResolvedValue(orgMemberMock);
      mockOrganisationRepository.findOneOrFail.mockResolvedValue(orgMemberMock.organisation_id);

      await expect(service.deleteOrganisationMember(orgMemberMock.id, nonOwnerUser.id)).rejects.toThrow(
        ForbiddenException
      );
    });
  });
});
