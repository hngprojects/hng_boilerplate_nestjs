import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { OwnershipGuard } from '../../guards/authorization.guard';
import * as SYS_MSG from '../../helpers/SystemMessages';
@ApiBearerAuth()
@ApiTags('Organisation Invites')
@Controller('organizations')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @ApiOperation({ summary: 'Get All Invitations' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @Get('invites')
  async findAllInvitations() {
    const allInvites = await this.inviteService.findAllInvitations();
    return allInvites;
  }

  @UseGuards(OwnershipGuard)
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

  @ApiOperation({ summary: 'Accept Invite To Organisation' })
  @ApiResponse({
    status: 201,
    description: SYS_MSG.MEMBER_ALREADY_SUCCESSFULLY,
  })
  @ApiResponse({
    status: 409,
    description: SYS_MSG.MEMBER_ALREADY_EXISTS,
  })
  @ApiResponse({
    status: 404,
    description: SYS_MSG.ORG_NOT_FOUND,
  })
  @Post('accept-invite')
  async acceptInvite(@Body() acceptInviteDto: AcceptInviteDto) {
    return await this.inviteService.acceptInvite(acceptInviteDto);
  }
}
