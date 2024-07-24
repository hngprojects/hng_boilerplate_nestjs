import { Body, Controller, HttpStatus, Post, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';

@Controller('auth')
export default class RegistrationController {
  constructor(private authService: AuthenticationService) {}

  @skipAuth()
  @Post('register')
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body);
    return response.status(createUserResponse.status_code).send(createUserResponse);
  }

  @Post('token/refresh')
  public async refreshToken(@Body('refreshToken') refreshToken: string, @Res() response: Response): Promise<any> {
    if (!refreshToken) {
      return response.status(HttpStatus.BAD_REQUEST).send({ message: 'Refresh token is required' });
    }

    const tokenResponse = await this.authService.refreshAccessToken(refreshToken);

    if (tokenResponse.status_code === HttpStatus.UNAUTHORIZED) {
      return response.status(HttpStatus.UNAUTHORIZED).send({ message: tokenResponse.message });
    }

    return response.status(HttpStatus.OK).send({ accessToken: tokenResponse.accessToken });
  }
}
