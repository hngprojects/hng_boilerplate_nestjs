import { Test, TestingModule } from '@nestjs/testing';
import { OrganisationsService } from '../organisations.service';
import { Repository } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Organisation } from '../entities/organisations.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { validate } from 'class-validator';
import { orgMock } from '../tests/mocks/organisation.mock';
import { createMockOrganisationRequestDto } from '../tests/mocks/organisation-dto.mock';
import UserService from '../../user/user.service'
import { newUser } from './mocks/new-user.mock';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
  UnauthorizedException,
} from '@nestjs/common';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let userRepository: Repository<User>;
  let organisationRepository: Repository<Organisation>;

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
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organisationRepository = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
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
  
  describe('it should validate before removing a user', () => {
    it("should throw error if organisation doesn't exist", async () => {
      await jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(null);

      await expect(service.removeUser(orgMock.owner.id, orgMock.members[0].id, orgMock.owner.id)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          message: 'Organisation not found',
          status_code: 404,
        })
      );
    });
    it("should throw if current user does't own the organisation", async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);

      await expect(service.removeUser(orgMock.id, orgMock.members[0].id, newUser.id)).rejects.toThrow(
        new UnauthorizedException({
          status: 'Forbidden',
          message: 'Only admin can remove users',
          status_code: 403,
        })
      );
    });
    it('should throw an error if the specified user is not a member', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);

      await expect(service.removeUser(orgMock.id, newUser.id, orgMock.owner.id)).rejects.toThrow(
        new NotFoundException({
          status: 'error',
          message: 'User not found',
          status_code: 404,
        })
      );
    });
  });

  describe('it should successfully remove a user', () => {
    it('should successfully remove user', async () => {
      jest.spyOn(organisationRepository, 'findOne').mockResolvedValue(orgMock);

      const result = await service.removeUser(orgMock.id, orgMock.members[0].id, orgMock.owner.id);

      expect(result.status).toEqual('Success');
      expect(result.message).toEqual('User removed successfully');
      expect(result.status_code).toEqual(200);
      
   )};
 )};
});
