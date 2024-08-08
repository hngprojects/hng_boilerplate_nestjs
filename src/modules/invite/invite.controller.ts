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
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InviteService } from './invite.service';
import { CreateInvitationDto } from './dto/create-invite.dto';

import { Response } from 'express';
import { CreateInviteResponseDto } from './dto/creat-invite-response.dto';
import { FindAllInvitationsResponseDto } from './dto/all-invitations-response.dto';
import { ErrorResponseDto } from './dto/invite-error-response.dto';
import { SendInvitationsResponseDto } from './dto/send-invitations-response.dto';

@ApiBearerAuth()
@ApiTags('Organisation Invites')
@Controller('organizations')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @ApiOperation({ summary: 'Get All Invitations' })
  @ApiResponse({
    status: 200,
    description: 'Successfully fetched all invitations',
    type: FindAllInvitationsResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @Get('invites')
  async findAllInvitations() {
    const allInvites = await this.inviteService.findAllInvitations();
    return allInvites;
  }

  @ApiOperation({ summary: 'Generate Invite Link for an Organization' })
  @ApiResponse({
    status: 200,
    description: 'Invite link generated successfully',
    type: CreateInviteResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
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

  @ApiOperation({ summary: 'Send Invitations to Multiple Emails' })
  @ApiResponse({
    status: 200,
    description: 'Invitation(s) sent successfully',
    type: SendInvitationsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  @Post('send-invite')
  async sendInvitations(@Body() createInvitationDto: CreateInvitationDto, @Res() res: Response): Promise<void> {
    await this.inviteService.sendInvitations(createInvitationDto);
  }
}
