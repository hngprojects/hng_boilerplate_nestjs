import { Body, Controller, HttpException, HttpStatus, Param, Post, Request } from '@nestjs/common';
import { Auth2FAService } from './auth2fa.service';

@Controller('auth/2fa')
export class Auth2FAController {
  constructor(private readonly auth2FAService: Auth2FAService) {}

  @Post('enable/:id')
  async enable2FA(@Param('id') id: string, @Request() req, @Body() body: { password: string }) {
    try {
      // const { user_id } = req.user;
      const user_id = id;
      const { password } = body;
      const result = await this.auth2FAService.enable2FA(user_id, password);

      return {
        status_code: 200,
        message: '2FA setup initiated',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status_code: error.status,
          message: error.message,
        },
        error.status
      );
    }
  }

  @Post('verify/:id')
  async verify2FA(@Param('id') id: string, @Request() req, @Body() body: { totp_code: string }) {
    try {
      // const { user_id } = req.user;
      const user_id = id;
      const { totp_code } = body;

      const result = await this.auth2FAService.verify2FA(user_id, totp_code);

      return {
        status_code: 200,
        message: '2FA verified and enabled',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status_code: error.status,
          message: error.message,
        },
        error.status
      );
    }
  }

  @Post('disable/:id')
  async disable2FA(@Param('id') id: string, @Request() req, @Body() body: { password: string; totp_code: string }) {
    try {
      // const { user_id } = req.user;
      const user_id = id;
      const { password, totp_code } = body;

      const result = await this.auth2FAService.disable2FA(user_id, password, totp_code);

      return {
        status_code: 200,
        message: '2FA has been disabled',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          status_code: error.status,
          message: error.message,
        },
        error.status
      );
    }
  }
}
