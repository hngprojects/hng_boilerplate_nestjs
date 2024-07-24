import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException } from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateInviteDto } from './dto/update-invite.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { skipAuth } from 'src/helpers/skipAuth';

@ApiBearerAuth()
@ApiTags('Organisation Invites')
@Controller('organisations/invitations')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  create(@Body() createInviteDto: CreateInviteDto) {
    return this.inviteService.create(createInviteDto);
  }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inviteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInviteDto: UpdateInviteDto) {
    return this.inviteService.update(+id, updateInviteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inviteService.remove(+id);
  }
}
