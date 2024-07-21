import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrganizationService } from './organization.service';
import { UserGuard } from './guards/user.guard';
import { OrganizationGuard } from './guards/organization.guard';

@Controller('/organisations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @UseGuards(JwtAuthGuard, OrganizationGuard, UserGuard)
  @Get(':orgId/users')
  async getUsers(
    @Param('orgId') orgId: string,
    @Query('page') page: number = 1,
    @Query('page_size') pageSize: number = 10,
    @Req() req
  ) {
    const users = await this.organizationService.getUsers(orgId, page, pageSize);
    return {
      status: 'success',
      message: 'Users retrieved successfully',
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        phone_number: user.profile.phone,
        name: `${user.first_name} ${user.last_name}`,
      })),
      status_code: 200,
    };
  }
}
