import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InviteDto } from './dto/invite.dto';
import { Invite } from './entities/invite.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite) private inviteRepository: Repository<Invite>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>
  ) {}

  async findAllInvitations(): Promise<{ status_code: number; message: string; data: InviteDto[] }> {
    try {
      const allInvites = await this.inviteRepository.find();

      const invites: InviteDto[] = allInvites.map(invite => ({
        id: invite.id,
        status: invite.status,
      }));

      const responseData = {
        status_code: 200,
        message: 'Successfully fetched invites',
        data: invites,
      };

      return responseData;
    } catch (error) {
      throw new InternalServerErrorException(`Internal server error: ${error.message}`);
    }
  }

  async generateInviteLink(organisationId: string): Promise<string> {
    const organization = await this.organisationRepository.findOneBy(organisationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const inviteLink = `${process.env.APP_URL}/invite/${uuidv4()}`;
    return inviteLink;
  }
}
