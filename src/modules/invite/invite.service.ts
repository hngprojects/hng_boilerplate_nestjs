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
import { User } from '../user/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { OrganisationsService } from '../organisations/organisations.service';
import { CreateInvitationDto } from './dto/create-invite.dto';
import { EmailService } from '../email/email.service';
import { CustomHttpException } from '../../helpers/custom-http-filter';

import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite) private inviteRepository: Repository<Invite>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    private readonly mailerService: MailerService,
    private readonly emailService: EmailService
  ) {}

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

    const link = `${process.env.FRONTEND_URL}/invite?token=${token}`;

    console.log('Invite link:', link, '[]:', process.env.FRONTEND_URL);

    const responseData = {
      status_code: HttpStatus.OK,
      message: 'Invite link generated successfully',
      link,
    };

    return responseData;
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
