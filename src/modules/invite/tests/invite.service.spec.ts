import { HttpStatus, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from '../../organisations/entities/organisations.entity';
import { User } from '../../user/entities/user.entity';
import { Invite } from '../entities/invite.entity';
import { InviteService } from '../invite.service';
import { MailerService } from '@nestjs-modules/mailer';
import { mockInvitesResponse } from '../mocks/mockInvitesReponse';
import { mockInvites } from '../mocks/mockInvites';
import { mockOrg } from '../mocks/mockOrg';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../../modules/email/email.service';
import { CreateInvitationDto } from '../dto/create-invite.dto';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

import { OrganisationsService } from '../../../modules/organisations/organisations.service';
import { mockUser } from '../mocks/mockUser';
import { orgMock } from '../../../modules/organisations/tests/mocks/organisation.mock';
import { Role } from '../../../modules/role/entities/role.entity';
import { Permissions } from '../../../modules/permissions/entities/permissions.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
jest.mock('uuid');

describe('InviteService', () => {
  let service: InviteService;
  let repository: Repository<Invite>;
  let organisationRepo: Repository<Organisation>;
  let emailService: EmailService;
  let mailerService: MailerService;
  let userRepository: Repository<User>;
  let permissionRepository: Repository<Permissions>;
  let organisationService: OrganisationsService;
  let configService: ConfigService;
  let frontendUrl: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        InviteService,
        OrganisationsService,
        ConfigService,
        {
          provide: getRepositoryToken(Invite),
          useValue: {
            find: jest.fn(),
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
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
          provide: getRepositoryToken(Role),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permissions),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permissions),
          useValue: {
            findBy: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: OrganisationsService,
          useValue: {
            addOrganisationMember: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            getTemplate: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InviteService>(InviteService);
    repository = module.get<Repository<Invite>>(getRepositoryToken(Invite));
    organisationRepo = module.get<Repository<Organisation>>(getRepositoryToken(Organisation));
    emailService = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
    service = module.get<InviteService>(InviteService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    organisationService = module.get<OrganisationsService>(OrganisationsService);
    configService = module.get<ConfigService>(ConfigService);
    frontendUrl = configService.get<string>('FRONTEND_URL');
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
        link: `${frontendUrl}/invite?token=${mockToken}`,
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

  describe('sendInvitations', () => {
    it('should throw an error if emails field is not an array', async () => {
      const dto: CreateInvitationDto = {
        emails: [],
        org_id: 'valid-org-id',
      };

      await expect(service.sendInvitations(dto)).rejects.toThrow(
        new CustomHttpException('Emails field is required and must be an array.', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw an error if one or more email addresses are invalid', async () => {
      const dto: CreateInvitationDto = {
        emails: ['invalid-email'],
        org_id: 'valid-org-id',
      };

      await expect(service.sendInvitations(dto)).rejects.toThrow(
        new CustomHttpException('One or more email addresses are not valid', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw an error if the organization is not found', async () => {
      const dto: CreateInvitationDto = {
        emails: ['valid@example.com'],
        org_id: 'invalid-org-id',
      };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(null);

      await expect(service.sendInvitations(dto)).rejects.toThrow(
        new CustomHttpException('Organization not found', HttpStatus.NOT_FOUND)
      );
    });

    it('should throw an error if more than 50 emails are provided', async () => {
      const dto: CreateInvitationDto = {
        emails: new Array(51).fill('valid@example.com'),
        org_id: 'valid-org-id',
      };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(mockOrg as Organisation);

      await expect(service.sendInvitations(dto)).rejects.toThrow(
        new CustomHttpException('Cannot send more than 50 invitations at once', HttpStatus.BAD_REQUEST)
      );
    });

    it('should throw an error if the invitation template is not found', async () => {
      const dto: CreateInvitationDto = {
        emails: ['valid@example.com'],
        org_id: 'valid-org-id',
      };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(mockOrg as Organisation);
      jest.spyOn(emailService, 'getTemplate').mockResolvedValue({ status_code: 404, message: 'Template not found' });

      await expect(service.sendInvitations(dto)).rejects.toThrow(
        new CustomHttpException('Invitation template not found', HttpStatus.BAD_REQUEST)
      );
    });

    it('should send invitations successfully', async () => {
      const dto: CreateInvitationDto = {
        emails: ['valid@example.com'],
        org_id: 'valid-org-id',
      };

      const mockToken = 'mock-uuid';
      const inviteLinkData = { link: `${frontendUrl}/invite?token=${mockToken}` };
      const template = '<html>...</html>';
      const mockOrgData = { name: 'Test Org' };

      jest.spyOn(organisationRepo, 'findOne').mockResolvedValue(mockOrgData as Organisation);
      jest
        .spyOn(emailService, 'getTemplate')
        .mockResolvedValue({ status_code: 200, message: 'Template retrieved successfully', template });
      jest.spyOn(service, 'createInvite').mockResolvedValue({
        status_code: HttpStatus.OK,
        message: 'Invite link generated successfully',
        link: `${frontendUrl}/invite?token=${mockToken}`,
      });
      jest.spyOn(mailerService, 'sendMail').mockResolvedValue({});

      const result = await service.sendInvitations(dto);

      expect(result).toEqual({
        message: 'Invitation(s) sent successfully',
        invitations: [{ email: 'valid@example.com', inviteLink: inviteLinkData.link }],
      });
      expect(mailerService.sendMail).toHaveBeenCalledWith({
        to: 'valid@example.com',
        subject: 'Invitation to join an organization',
        html: expect.any(String),
      });
    });
    describe('Accept Invite Service', () => {
      it('should throw NotFoundException if invite not found', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(null);

        await expect(service.acceptInvite({ token: 'invalid-token', email: 'test@example.com' })).rejects.toThrow(
          CustomHttpException
        );
      });

      it('should throw BadRequestException if email does not match non-generic invite', async () => {
        const mockInvite = {
          id: 'some-id',
          token: 'valid-token',
          email: 'test@example.com',
          isGeneric: false,
          isAccepted: true,
          organisation: null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);

        await expect(service.acceptInvite({ token: 'valid-token', email: 'wrong@example.com' })).rejects.toThrow(
          CustomHttpException
        );
      });

      it('should throw BadRequestException if invite already accepted', async () => {
        const mockInvite = {
          id: 'some-id',
          token: 'valid-token',
          email: 'test@example.com',
          isGeneric: false,
          isAccepted: true,
          organisation: null,
          created_at: new Date(),
          updated_at: new Date(),
        };

        jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);

        await expect(service.acceptInvite({ token: 'valid-token', email: 'test@example.com' })).rejects.toThrow(
          CustomHttpException
        );
      });

      it('should throw NotFoundException if user not found', async () => {
        jest.spyOn(repository, 'findOne').mockResolvedValue(null);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

        await expect(service.acceptInvite({ token: 'valid-token', email: 'test@example.com' })).rejects.toThrow(
          CustomHttpException
        );
      });

      it('should throw InternalServerErrorException if adding member fails', async () => {
        const mockInvite = {
          id: 'some-id',
          token: 'valid-token',
          email: 'test@example.com',
          isGeneric: false,
          isAccepted: false,
          organisation: orgMock,
          created_at: new Date(),
          updated_at: new Date(),
        };

        jest.spyOn(repository, 'findOne').mockResolvedValue(mockInvite);
        jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
        jest
          .spyOn(organisationService, 'addOrganisationMember')
          .mockResolvedValue({ status: 'error', message: 'Member added', member: mockUser });

        await expect(service.acceptInvite({ token: 'valid-token', email: 'test@example.com' })).rejects.toThrow(
          CustomHttpException
        );
      });
    });
  });
});
