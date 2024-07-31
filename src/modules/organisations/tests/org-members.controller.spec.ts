import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationMembersController } from '../controllers/org-members.controller';
import { OrganisationMembersService } from '../services/org-members.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { orgMemberMock } from './mocks/org-members.mock';
import { AuthGuard } from '../../../guards/auth.guard';
import { OwnershipGuard } from '../guards/ownership.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organisation } from '../entities/organisations.entity';

describe('OrganisationMembersController', () => {
  let controller: OrganisationMembersController;
  let service: OrganisationMembersService;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockOrganisationRepository = {
    findOneOrFail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganisationMembersController],
      providers: [
        {
          provide: OrganisationMembersService,
          useValue: {
            deleteOrganisationMember: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(Organisation),
          useValue: mockOrganisationRepository,
        },
        Reflector,
        AuthGuard,
        OwnershipGuard,
      ],
    }).compile();

    controller = module.get<OrganisationMembersController>(OrganisationMembersController);
    service = module.get<OrganisationMembersService>(OrganisationMembersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteOrganisationMember', () => {
    it('should call service to delete organisation member if user is owner', async () => {
      const deleteSpy = jest.spyOn(service, 'deleteOrganisationMember').mockResolvedValue(undefined);

      await controller.deleteOrganisationMember(orgMemberMock.id, {
        user: { id: orgMemberMock.organisation_id.owner.id },
      });
      expect(deleteSpy).toHaveBeenCalledWith(orgMemberMock.id, orgMemberMock.organisation_id.owner.id);
    });

    it('should handle ForbiddenException if user is not owner', async () => {
      jest.spyOn(service, 'deleteOrganisationMember').mockRejectedValue(new ForbiddenException());

      await expect(
        controller.deleteOrganisationMember(orgMemberMock.id, { user: { id: 'non-owner-id' } })
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle NotFoundException if organisation member not found', async () => {
      jest.spyOn(service, 'deleteOrganisationMember').mockRejectedValue(new NotFoundException());

      await expect(
        controller.deleteOrganisationMember(orgMemberMock.id, { user: { id: orgMemberMock.organisation_id.owner.id } })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
