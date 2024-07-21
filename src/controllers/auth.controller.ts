import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { LoginDto } from 'src/dto/auth.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Res() res: Response, @Body() loginData: LoginDto) {
    const { data, tokens } = await this.authService.login(loginData);

    return res.status(200).json({
      message: 'User login successful',
      data: { user: data, access_token: tokens.accessToken, refresh_token: tokens.refreshToken },
    });
  }
}
