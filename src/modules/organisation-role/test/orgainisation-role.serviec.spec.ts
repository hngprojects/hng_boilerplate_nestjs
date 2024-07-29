import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrganisationRoleService } from '../organisation-role.service';
import { OrganisationRole } from '../entities/organisation-role.entity';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { NotFoundException } from '@nestjs/common';

describe('OrganisationRoleService', () => {
  let service: OrganisationRoleService;
  let rolesRepository: Repository<OrganisationRole>;
  let organisationRepository: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationRoleService,
        {
          provide: getRepositoryToken(OrganisationRole),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationRoleService>(OrganisationRoleService);
    rolesRepository = module.get<Repository<OrganisationRole>>(getRepositoryToken(OrganisationRole));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllRolesInOrganisation', () => {
    it('should return an array of roles for an existing organization', async () => {
      const organisationId = '1';
      const mockRoles = [
        { id: '1', name: 'Admin', description: 'Administrator role' },
        { id: '2', name: 'User', description: 'Regular user role' },
      ];

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: organisationId } as Organisation);
      jest.spyOn(rolesRepository, 'find').mockResolvedValue(mockRoles as OrganisationRole[]);

      const roles = await service.getAllRolesInOrg(organisationId);
      expect(roles).toEqual(mockRoles);
    });

    it('should throw NotFoundException if the organisation is not found', async () => {
      const organisationId = '1';
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getAllRolesInOrg(organisationId)).rejects.toThrow(NotFoundException);
    });
    it('should handle cases where roles are not available', async () => {
      const organisationId = '1';

      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue({ id: organisationId } as Organisation);
      jest.spyOn(rolesRepository, 'find').mockResolvedValue([]);

      const roles = await service.getAllRolesInOrg(organisationId);
      expect(roles).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      const organisationId = '1';

      jest.spyOn(organisationRepository, 'findOne').mockRejectedValue(new Error('Database error'));

      await expect(service.getAllRolesInOrg(organisationId)).rejects.toThrowError('Database error');
    });
  });
});
