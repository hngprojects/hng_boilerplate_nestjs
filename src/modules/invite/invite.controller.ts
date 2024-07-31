import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendInvitesDto } from './dto/send-invites.dto';

@ApiBearerAuth()
@ApiTags('Organisation Invites')
@Controller('organisation')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @ApiOperation({ summary: 'Get All Invitations' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @Get()
  async findAllInvitations() {
    const allInvites = await this.inviteService.findAllInvitations();
    return allInvites;
  }

  @Get(':org_id/invite/create')
  async generateInviteLink(@Param('organizationId') organizationId: string): Promise<{ link: string }> {
    try {
      const link = await this.inviteService.generateInviteLink(organizationId);
      return { link };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else if (error instanceof InternalServerErrorException) {
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Post('send-invites')
  async sendInvites(@Body() sendInvitesDto: SendInvitesDto): Promise<{ message: string }> {
    try {
      await this.inviteService.sendInvites(sendInvitesDto.organizationId, sendInvitesDto.emails);
      return { message: 'Invites sent successfully' };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
