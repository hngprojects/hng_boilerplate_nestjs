import { Controller, Post, Body, Headers, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
// import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
// import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

@Controller('api/v1/organisations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('send-invite')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async sendInvite(
    @Body('emails') emails: string[],
    @Body('org_id') orgId: string,
    @Headers('Authorization') authHeader?: string
  ) {
    let adminId: string;
    if (authHeader) {
      adminId = this.extractAdminIdFromToken(authHeader);
    } else {
      // Set a dummy adminId or handle the case without auth
      adminId = 'dummy-admin-id'; // Use a fixed adminId for testing purposes
    }

    try {
      const invitations = await this.invitationsService.sendInvitations(emails, orgId, adminId);
      return {
        message: 'Invitation(s) sent successfully',
        invitations,
      };
    } catch (error) {
      console.log(error);

      throw new HttpException('Error sending invitations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private extractAdminIdFromToken(authHeader: string): string {
    const token = authHeader.split(' ')[1];
    const decodedToken = this.invitationsService.decodeToken(token);
    return decodedToken.sub;
  }
}
