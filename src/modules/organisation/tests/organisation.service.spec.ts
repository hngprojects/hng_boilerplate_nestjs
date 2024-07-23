import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationService } from '../organisation.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Organisation } from '../entities/organisation.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('OrganisationService', () => {
  let service: OrganisationService;
  let repository: Repository<Organisation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationService,
        {
          provide: getRepositoryToken(Organisation),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<OrganisationService>(OrganisationService);
    repository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
  });

  describe('update', () => {
    it('should update an organisation successfully', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };
      const organisation = new Organisation();

      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(repository, 'update').mockResolvedValueOnce({ affected: 1 } as any);
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce({ ...organisation, ...updateOrganisationDto });

      const result = await service.update(id, updateOrganisationDto);

      expect(result).toEqual({
        message: 'Product successfully updated',
        org: { ...organisation, ...updateOrganisationDto },
      });
    });

    it('should throw NotFoundException if organisation not found', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.update(id, updateOrganisationDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if update fails', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };
      const organisation = new Organisation();

      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(repository, 'update').mockResolvedValueOnce({ affected: 0 } as any);
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.update(id, updateOrganisationDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(repository, 'findOneBy').mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.update(id, updateOrganisationDto)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
