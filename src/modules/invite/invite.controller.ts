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
  Query,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SendInvitesDto } from './dto/send-invites.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

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

  @Get(':org_id/invite')
  async generateInviteLink(@Param('org_id') organizationId: string): Promise<{ link: string }> {
    try {
      return await this.inviteService.createInvite(organizationId);
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

  @Post(':org_id/send-invite')
  async sendInvites(
    @Param('org_id') organizationId: string,
    @Body() sendInvitesDto: SendInvitesDto
  ): Promise<{ message: string }> {
    try {
      return await this.inviteService.sendEmailInvites(organizationId, sendInvitesDto.emails);
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

  @Post('accept-invite')
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto): Promise<void> {
    await this.inviteService.acceptInvite(acceptInviteDto);
  }
}
