import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InviteDto } from './dto/invite.dto';
import { Invite } from './entities/invite.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite) private inviteRepository: Repository<Invite>,
    @InjectRepository(Organisation) private organisationRepository: Repository<Organisation>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}

  async findAllInvitations(): Promise<{ status_code: number; message: string; data: Invite[] }> {
    try {
      const invites = await this.inviteRepository.find();

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

    const link = `${process.env.APP_URL}/invite?token=${token}`;

    const responseData = {
      status_code: 200,
      message: 'Invite Link generated successfully',
      link,
    };

    return responseData;
  }

  async sendEmailInvites(organisationId: string, emails: string[]): Promise<any> {
    const organisation = await this.organisationRepository.findOne({ where: { id: organisationId } });
    if (!organisation) {
      throw new NotFoundException('organisation not found');
    }
    const existingInvites = await this.inviteRepository.find({ where: { organisation } });

    for (const email of emails) {
      const existingInvite = existingInvites.find(invite => invite.email === email);
      if (existingInvite.isAccepted) {
        throw new BadRequestException(`Invite already sent to ${email}`);
      }
      const token = uuidv4();
      const invite = await this.inviteRepository.create({ email, token, organisation, isGeneric: false });
      await this.inviteRepository.save(invite);
      const link = `${process.env.APP_URL}/invite?token=${token}`;

      //email sending logic here (using Bull queue )
      return { message: 'Invites sent successfully' };
    }
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto): Promise<void> {
    const { token, email } = acceptInviteDto;
    const invite = await this.inviteRepository.findOne({ where: { token } });

    if (!invite) {
      throw new NotFoundException('Invalid invite link');
    }

    if (!invite.isGeneric && invite.email !== email) {
      throw new BadRequestException('Invite email does not match');
    }

    if (invite.isAccepted) {
      throw new BadRequestException('Invite already accepted');
    }

    // Additional logic for accepting the invite (adding user to organisation)
    const user = await this.userRepository.findOne({ where: { email } });
    const organisation = await this.organisationRepository.findOne({ where: { id: invite.organisation.id } });

    invite.isAccepted = true;
    await this.inviteRepository.save(invite);
  }
}
