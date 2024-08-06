import {
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InviteDto } from './dto/invite.dto';
import { Invite } from './entities/invite.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite) private inviteRepository: Repository<Invite>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>
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

  async refreshInvite(orgId: string, inviteId) {
    try {
      const organisation = await this.organisationRepository.findOne({ where: { id: orgId } });

      if (!organisation) {
        throw new NotFoundException({
          status_code: 404,
          error: 'Not Found',
          message: `The organization with ID ${orgId} does not exist`,
        });
      }

      const invitation = await this.inviteRepository.findOne({
        where: {
          id: inviteId,
          organisation: organisation,
        },
      });

      if (!invitation) {
        throw new NotFoundException({
          status_code: 404,
          error: 'Not Found',
          message: `The invitation with ID ${inviteId} does not exist in this organization`,
        });
      }

      if (invitation.isAccepted) {
        throw new ForbiddenException({
          status_code: 403,
          message: `The invitation cannot be refreshed because it has been accepted`,
        });
      }

      const newToken = uuidv4();

      const updatedInvitation = this.inviteRepository.save({
        ...invitation,
        token: newToken,
      });
      const link = `${process.env.FRONTEND_URL}/invite?token=${newToken}`;

      return {
        status_code: 200,
        data: {
          ...updatedInvitation,
          link,
        },
        message: 'Invitation link refreshed successfully',
      };
    } catch (err) {
      throw new InternalServerErrorException({
        message: `Something went wrong: ${err.message}`,
        status_code: 500,
      });
    }
  }
}
