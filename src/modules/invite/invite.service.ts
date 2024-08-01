import { HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InviteDto } from './dto/invite.dto';
import { Invite } from './entities/invite.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Repository } from 'typeorm';
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

  async sendEmailInvites(organisationId: string, emails: string[]): Promise<any> {
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!organisation) {
      throw new NotFoundException('organisation not found');
    }

    const existingInvites = await this.inviteRepository.find({
      where: { organisation: { id: organisationId } },
      relations: ['organisation'],
    });

    for (const email of emails) {
      const existingInvite = existingInvites.find(invite => invite.email === email);
      if (existingInvite) {
        await this.inviteRepository.remove(existingInvite);
      }
      const token = uuidv4();
      const invite = await this.inviteRepository.create({ email, token, organisation, isGeneric: false });
      await this.inviteRepository.save(invite);
      const link = `${process.env.FRONTEND_URL}/invite?token=${token}`;
      //email sending logic here (using Bull queue )
    }

    return { message: 'Invites sent successfully' };
  }
}
