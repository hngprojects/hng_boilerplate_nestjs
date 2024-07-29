import { BadRequestException, Injectable } from '@nestjs/common';
import authConfig from '../../../config/auth.config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private clientId = authConfig().google.clientID;
  private client = new OAuth2Client(this.clientId);

  async verifyToken(token: string): Promise<any> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.clientId,
      });

      const payload = ticket.getPayload();

      return payload;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid Google token');
    }
  }
}
