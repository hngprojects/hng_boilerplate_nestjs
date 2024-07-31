import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsService } from '../organisations.service';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { orgMock } from './mocks/organisation.mock';
import { createMockOrganisationRequestDto } from './mocks/organisation-dto.mock';
import UserService from '../../user/user.service';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { Profile } from '../../profile/entities/profile.entity';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;
  let profileRepository: Repository<Profile>;

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
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            findBy: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
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

  describe('delete organisation', () => {
    it('should delete an organisation successfully', async () => {
      const id = '1';
      const organisation = new Organisation();
      organisation.id = id;

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(organisation);
      jest.spyOn(organisationRepository, 'save').mockResolvedValueOnce(organisation);

      const result = await service.deleteOrganisation(id);

      expect(organisationRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(organisationRepository.save).toHaveBeenCalledWith(expect.objectContaining({ isDeleted: true }));
      expect(result).toEqual(204);
    });

    it('should throw NotFoundException if organisation not found', async () => {
      const id = '1';

      jest.spyOn(organisationRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.deleteOrganisation(id)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an unexpected error occurs', async () => {
      const id = '1';

      jest.spyOn(organisationRepository, 'findOneBy').mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.deleteOrganisation(id)).rejects.toThrow(InternalServerErrorException);
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

  describe('getOrganisationMembers', () => {
    it('should throw NotFoundException if organisation is not found', async () => {
      organisationRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.getOrganisationMembers('orgId', 1, 2, 'testUserId')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if the user is not a member', async () => {
      const mockOrganisation = {
        id: 'orgId',
        organisationMembers: [
          {
            user_id: { id: 'anotherUserId' },
          },
        ],
      } as unknown as Organisation;

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);

      await expect(service.getOrganisationMembers('orgId', 1, 10, 'sub')).rejects.toThrow(ForbiddenException);
    });

    it('should return paginated members if the user is a member', async () => {
      const mockOrganisation = {
        id: 'orgId',
        organisationMembers: [
          { user_id: { id: 'sub', first_name: 'John', last_name: 'Doe', email: 'john@email.com', phone: '0000' } },
          {
            user_id: {
              id: 'anotherUserId',
              first_name: 'Jane',
              last_name: 'Doe',
              email: 'jane@email.com',
              phone: '1111',
            },
          },
        ],
      } as unknown as Organisation;

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);

      const result = await service.getOrganisationMembers('orgId', 1, 1, 'sub');

      expect(result.status_code).toBe(200);
      expect(result.data).toEqual([{ id: 'sub', name: 'John Doe', email: 'john@email.com', phone_number: '0000' }]);
    });

    it('should paginate members correctly', async () => {
      const mockOrganisation = {
        id: 'orgId',
        organisationMembers: [
          { user_id: { id: 'sub', first_name: 'John', last_name: 'Doe', email: 'john@email.com', phone: '0000' } },
          {
            user_id: {
              id: 'anotherUserId',
              first_name: 'Jane',
              last_name: 'Doe',
              email: 'jane@email.com',
              phone: '1111',
            },
          },
        ],
      } as unknown as Organisation;

      organisationRepository.findOne = jest.fn().mockResolvedValue(mockOrganisation);

      const result = await service.getOrganisationMembers('orgId', 2, 1, 'sub');

      expect(result.status_code).toBe(200);
      expect(result.data).toEqual([
        { id: 'anotherUserId', name: 'Jane Doe', email: 'jane@email.com', phone_number: '1111' },
      ]);
    });
  });
});
