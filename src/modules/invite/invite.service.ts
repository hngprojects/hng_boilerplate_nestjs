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
import { User } from '../user/entities/user.entity';
import { OrganisationMember } from '../organisations/entities/org-members.entity';
import { OrganisationsService } from '../organisations/organisations.service';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite) private inviteRepository: Repository<Invite>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    @InjectRepository(OrganisationMember) private orgMemberRepository: Repository<OrganisationMember>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly OrganisationService: OrganisationsService
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

    const responseData = {
      status_code: HttpStatus.OK,
      message: 'Invite link generated successfully',
      link,
    };

    return responseData;
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto): Promise<{
    status: string;
    message: string;
  }> {
    const { token, email } = acceptInviteDto;
    const invite = await this.inviteRepository.findOne({ where: { token }, relations: ['organisation'] });

    if (!invite) {
      throw new NotFoundException('Invite link not found');
    }

    if (!invite.isGeneric && invite.email !== email) {
      throw new BadRequestException('Invalid invite link');
    }

    if (invite.isAccepted) {
      throw new BadRequestException('Invite already accepted');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException({
        error: 'Not Found',
        message: 'User not found, register to continue',
        status_code: HttpStatus.NOT_FOUND,
      });
    }

    const response = await this.OrganisationService.addOrganisationMember(invite.organisation.id, {
      user_id: user.id,
    });

    if (response.status === 'success') {
      invite.isAccepted = true;
      await this.inviteRepository.save(invite);
      return response;
    } else {
      throw new InternalServerErrorException('Failed to add member to the organisation');
    }
  }
}
