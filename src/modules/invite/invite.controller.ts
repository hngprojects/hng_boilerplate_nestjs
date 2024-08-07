import {
  Controller,
  Get,
  Param,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { isUUID } from 'class-validator';
import { CustomHttpException } from '../../helpers/custom-http-filter';

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

  @Post(':orgId/invite/:inviteId/refresh')
  async refreshInvitation(@Param('orgId') orgId: string, @Param('inviteId') inviteId: string) {
    if (isUUID(orgId, 4)) {
      throw new CustomHttpException(
        {
          status_code: 400,
          error: 'Bad Request',
          message: 'Invalid organisation ID format',
        },
        400
      );
    } else if (isUUID(inviteId, 4)) {
      throw new CustomHttpException(
        {
          status_code: 400,
          error: 'Bad Request',
          message: 'Invalid organisation ID format',
        },
        400
      );
    }

    return await this.inviteService.refreshInvite(orgId, inviteId);
  }
}
