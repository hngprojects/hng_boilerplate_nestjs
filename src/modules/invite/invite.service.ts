import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { Invite } from './entities/invite.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class InviteService {
  constructor(@InjectRepository(Invite) private inviteRepository: Repository<Invite>) {}

  create(createInviteDto: CreateInviteDto) {
    return 'This action adds a new invite';
  }

  async findAll() {
    try {
      const allInvites = await this.inviteRepository.find();

      const invites = allInvites.map(invite => ({
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
  findOne(id: number) {
    return `This action returns a #${id} invite`;
  }

  update(id: number, updateInviteDto: UpdateInviteDto) {
    return `This action updates a #${id} invite`;
  }

  remove(id: number) {
    return `This action removes a #${id} invite`;
  }
}
