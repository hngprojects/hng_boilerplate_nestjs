import { Controller, Post, Body, Headers, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { STATUS_CODES } from '../constants/statusCodes';

@Controller('api/v1/organisations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('send-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
        status_code: STATUS_CODES.SUCCESS,
        message: 'Invitation(s) sent successfully',
        invitations,
      };
    } catch (error) {
      console.log(error);

      throw new HttpException(
        {
          status_code: STATUS_CODES.INTERNAL_SERVER_ERROR,
          error: 'Error sending invitations',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private extractAdminIdFromToken(authHeader: string): string {
    const token = authHeader.split(' ')[1];
    console.log(token);
    const decodedToken = this.invitationsService.decodeToken(token);
    return decodedToken.sub;
  }
}
