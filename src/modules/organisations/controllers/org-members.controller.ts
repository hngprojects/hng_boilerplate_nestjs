import { Controller, Delete, Param, ParseUUIDPipe, Req, UseGuards } from '@nestjs/common';
import { OrganisationMembersService } from '../services/org-members.service';
import { AuthGuard } from '../../../guards/auth.guard';
import { OwnershipGuard } from '../guards/ownership.guard';

@Controller('organisation-members')
export class OrganisationMembersController {
  constructor(private readonly organisationMembersService: OrganisationMembersService) {}

  @UseGuards(AuthGuard, OwnershipGuard)
  @Delete(':id')
  async deleteOrganisationMember(@Param('id', ParseUUIDPipe) id: string, @Req() req): Promise<void> {
    const ownerId = req.user.id;
    await this.organisationMembersService.deleteOrganisationMember(id, ownerId);
  }
}
