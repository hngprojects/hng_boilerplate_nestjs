import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { LoginDto } from 'src/dto/auth.dto';
import { AuthService } from 'src/services/auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ description: 'Success' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiUnprocessableEntityResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  async login(@Res() res: Response, @Body() loginData: LoginDto) {
    const { data, tokens } = await this.authService.login(loginData);

    return res.status(200).json({
      message: 'User login successful',
      data: { user: data, access_token: tokens.accessToken, refresh_token: tokens.refreshToken },
    });
  }
}
