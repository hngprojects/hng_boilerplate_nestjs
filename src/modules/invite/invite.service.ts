import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { InviteDto } from './dto/invite.dto';
import { Invite } from './entities/invite.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InviteService {
  constructor(@InjectRepository(Invite) private inviteRepository: Repository<Invite>) {}

  async findAllInvitations(): Promise<{ status_code: number; message: string; data: InviteDto[] }> {
    try {
      const allInvites = await this.inviteRepository.find();

      const invites: InviteDto[] = allInvites.map(invite => ({
        id: invite.id,
        email: invite.email,
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
}
