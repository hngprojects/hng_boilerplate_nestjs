import { JwtService } from '@nestjs/jwt';

export default class Utils {
  static async assignJwtToken(userId: string, jwtService: JwtService): Promise<string> {
    const payload = { id: userId };
    const access_token = await jwtService.sign(payload);
    return access_token;
  }

  static async assignRefreshJwtToken(userId: string, jwtService: JwtService): Promise<string> {
    const payload = { id: userId };
    const refresh_token = await jwtService.sign(payload);
    return refresh_token;
  }
}
