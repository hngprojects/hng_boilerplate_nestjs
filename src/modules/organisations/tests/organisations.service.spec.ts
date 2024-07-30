import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsService } from '../organisations.service';
import { createQueryBuilder, Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { orgMock } from '../tests/mocks/organisation.mock';
import { createMockOrganisationRequestDto } from '../tests/mocks/organisation-dto.mock';
import UserService from '../../user/user.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { newUser } from './mocks/new-user.mock';
import { OrganisationMember } from '../entities/org-members.entity';

class MockQueryBuilder {
  getCount = jest.fn().mockResolvedValue(0);
  where = jest.fn().mockReturnThis();
  andWhere = jest.fn().mockReturnThis();
}

class MockFailQueryBuilder extends MockQueryBuilder {
  getCount = jest.fn().mockResolvedValue(1);
}

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;
  let orgMemberRepository: Repository<OrganisationMember>;
  let mockQueryBuilder: MockQueryBuilder = new MockQueryBuilder();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsService,
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
          provide: getRepositoryToken(OrganisationMember),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    orgMemberRepository = module.get<Repository<OrganisationMember>>(getRepositoryToken(OrganisationMember));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create organisation', () => {
    beforeEach(async () => {
      const errors = await validate(createMockOrganisationRequestDto());
      expect(errors).toHaveLength(0);
    });

    it('should create an organisation', async () => {
      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue(null);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        ...orgMock.owner,
      } as User);
      jest.spyOn(organisationRepository, 'create').mockReturnValue(orgMock);
      jest.spyOn(organisationRepository, 'save').mockResolvedValue({
        ...orgMock,
      });

      const result = await service.create(createMockOrganisationRequestDto(), orgMock.owner.id);
      expect(result.status).toEqual('success');
      expect(result.message).toEqual('organisation created successfully');
    });

    it('should throw an error if the email already exists', async () => {
      jest.spyOn(organisationRepository, 'findBy').mockResolvedValue([orgMock]);
      await expect(service.create(createMockOrganisationRequestDto(), orgMock.owner.id)).rejects.toThrow(
        new UnprocessableEntityException({
          status: 'Unprocessable entity exception',
          message: 'Invalid organisation credentials',
          status_code: 422,
        })
      );
    });
  });

  describe('delete organization', () => {
    it('should delete an organisation successfully', async () => {
      const id = '1';
      const organisation = new Organisation();
      organisation.id = id;

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(organisationRepository, 'save').mockResolvedValueOnce(organisation);

      const result = await service.deleteOrganization(id);

      expect(organisationRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(organisationRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isDeleted: true }));
      expect(result).toEqual(204); // HttpStatus.NO_CONTENT
    });

    it('should throw NotFoundException if organisation not found', async () => {
      const id = '1';

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.deleteOrganization(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const id = '1';

      jest.spyOn(organisationRepository, 'findOneBy').mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.deleteOrganization(id)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update organisation', () => {
    it('should update an organisation successfully', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };
      const organisation = new Organisation();

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(organisationRepository, 'update').mockResolvedValueOnce({ affected: 1 } as any);
      jest
        .spyOn(organisationRepository, 'findOneBy')
        .mockResolvedValueOnce({ ...organisation, ...updateOrganisationDto });

      const result = await service.updateOrganisation(id, updateOrganisationDto);

      expect(result).toEqual({
        message: 'Organisation successfully updated',
        org: { ...organisation, ...updateOrganisationDto },
      });
    });

    it('should throw NotFoundException if organisation not found', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.updateOrganisation(id, updateOrganisationDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const id = '1';
      const updateOrganisationDto = { name: 'New Name', description: 'Updated Description' };

      jest.spyOn(organisationRepository, 'findOneBy').mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.updateOrganisation(id, updateOrganisationDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('it should validate before adding a user', () => {
    it('should throw an error if the organisation does not exist', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addMember(orgMock.owner.id, newUser.id, orgMock.owner.id)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          message: 'Organisation not found',
          status_code: 404,
        })
      );
    });

    it("should throw if current user does't own the organisation", async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);

      await expect(service.addMember(orgMock.id, newUser.id, newUser.id)).rejects.toThrow(
        new UnauthorizedException({
          status: 'Forbidden',
          message: 'Only admins can add users',
          status_code: 403,
        })
      );
    });

    it('should throw an error if the specified user does not exist', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.addMember(orgMock.id, orgMock.id, orgMock.owner.id)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          message: 'User not found',
          status_code: 404,
        })
      );
    });
  });

  describe('it should successfully add a user', () => {
    it('should successfully add user', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(newUser);

      const result = await service.addMember(orgMock.id, newUser.id, orgMock.owner.id);

      expect(result.status).toEqual('Success');
      expect(result.message).toEqual('User added successfully');
      expect(result.status_code).toEqual(200);
    });

    it('should throw an error if the user is already a member', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(newUser);
      jest.spyOn(service, 'checkIfUserIsMember').mockResolvedValue(1);
      const res = await service.checkIfUserIsMember(newUser.id, orgMock.id);
      expect(res).toBeGreaterThanOrEqual(1);

      await expect(service.addMember(orgMock.id, newUser.id, orgMock.owner.id)).rejects.toThrow(
        new ConflictException({
          status: 'error',
          message: 'User is already a member of this organisation',
          status_code: 409,
        })
      );
    });
  });
});
