import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InviteDto } from './dto/invite.dto';
import { Invite } from './entities/invite.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import * as SYS_MSG from '../../helpers/SystemMessages';
import { User } from '../user/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { OrganisationsService } from '../organisations/organisations.service';
import { CreateInvitationDto } from './dto/create-invite.dto';
import { EmailService } from '../email/email.service';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite) private inviteRepository: Repository<Invite>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly OrganisationService: OrganisationsService
  ) {}

  async getPendingInvites(): Promise<{ status_code: number; message: string; data: InviteDto[] }> {
    try {
      const pendingInvites = await this.inviteRepository.find({
        where: { isAccepted: false },
      });

      const pendingInvitesDto: InviteDto[] = pendingInvites.map(invite => {
        return {
          token: invite.token,
          id: invite.id,
          isAccepted: invite.isAccepted,
          isGeneric: invite.isGeneric,
          organisation: invite.organisation,
          email: invite.email,
        };
      });
      const responseData = {
        status_code: HttpStatus.OK,
        message: 'Successfully fetched pending invites',
        data: pendingInvitesDto,
      };

      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

  async findAllInvitations(): Promise<{ status_code: number; message: string; data: InviteDto[] }> {
    try {
      const invites = await this.inviteRepository.find();

      const allInvites: InviteDto[] = invites.map(invite => {
        return {
          token: invite.token,
          id: invite.id,
          isAccepted: invite.isAccepted,
          isGeneric: invite.isGeneric,
          organisation: invite.organisation,
          email: invite.email,
        };
      });

      const responseData = {
        status_code: HttpStatus.OK,
        message: 'Successfully fetched invites',
        data: allInvites,
      };

      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

  async createInvite(organisationId: string) {
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!organisation) {
      throw new NotFoundException('organisation not found');
    }

    const token = uuidv4();

    const invite = await this.inviteRepository.create({
      token,
      organisation: organisation,
      isGeneric: true,
    });

    await this.inviteRepository.save(invite);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const link = `${frontendUrl}/invite?token=${token}`;

    const responseData = {
      status_code: HttpStatus.OK,
      message: 'Invite link generated successfully',
      link,
    };

    return responseData;
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto) {
    const { token, email } = acceptInviteDto;
    const invite = await this.inviteRepository.findOne({ where: { token }, relations: ['organisation'] });

    if (!invite) {
      throw new CustomHttpException(SYS_MSG.INVITE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    if (!invite.isGeneric && invite.email !== email) {
      throw new CustomHttpException(SYS_MSG.INVITE_ACCEPTED, HttpStatus.BAD_REQUEST);
    }

    if (invite.isAccepted) {
      throw new CustomHttpException(SYS_MSG.INVITE_ACCEPTED, HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new CustomHttpException(SYS_MSG.USER_NOT_REGISTERED, HttpStatus.NOT_FOUND);
    }

    const response = await this.OrganisationService.addOrganisationMember(invite.organisation.id, {
      user_id: user.id,
    });

    if (response.status === 'success') {
      invite.isAccepted = true;
      await this.inviteRepository.save(invite);
      return response;
    } else {
      throw new CustomHttpException(SYS_MSG.MEMBER_NOT_ADDED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async sendInvitations(createInvitationDto: CreateInvitationDto): Promise<any> {
    if (!Array.isArray(createInvitationDto.emails) || createInvitationDto.emails.length === 0) {
      throw new CustomHttpException('Emails field is required and must be an array.', HttpStatus.BAD_REQUEST);
    }

    const invalidEmails = createInvitationDto.emails.filter(
      email => !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)
    );
    if (invalidEmails.length > 0) {
      throw new CustomHttpException('One or more email addresses are not valid', HttpStatus.BAD_REQUEST);
    }

    const organisation = await this.organisationRepository.findOne({ where: { id: createInvitationDto.org_id } });
    if (!organisation) {
      throw new CustomHttpException('Organization not found', HttpStatus.NOT_FOUND);
    }

    if (createInvitationDto.emails.length > 50) {
      throw new CustomHttpException('Cannot send more than 50 invitations at once', HttpStatus.BAD_REQUEST);
    }

    const templateResponse = await this.emailService.getTemplate({ templateName: 'organization-invitation' });
    if (templateResponse.status_code !== 200) {
      throw new CustomHttpException('Invitation template not found', HttpStatus.BAD_REQUEST);
    }

    const template = templateResponse.template.toString();

    const invitations = [];
    for (const email of createInvitationDto.emails) {
      const inviteLinkData = await this.createInvite(createInvitationDto.org_id);
      const inviteLink = inviteLinkData.link;

      const personalizedContent = template
        .replace(`{{organizationName}}`, organisation.name)
        .replace('{{recipientName}}', email.split('@')[0])
        .replace('{{invitationLink}}', inviteLink);

      invitations.push({ email, inviteLink });

      await this.mailerService.sendMail({
        to: email,
        subject: 'Invitation to join an organization',
        html: personalizedContent,
      });
    }

    return {
      message: 'Invitation(s) sent successfully',
      invitations,
    };
  }
}
