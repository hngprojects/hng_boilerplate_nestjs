import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { BAD_REQUEST, TWO_FA_INITIATED } from 'src/helpers/SystemMessages';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { CustomRequest } from '../user/interfaces/custom-request.interface';

@Controller('auth')
export default class RegistrationController {
  constructor(private authService: AuthenticationService) {}

  @skipAuth()
  @Post('register')
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body);
    return response.status(createUserResponse.status_code).send(createUserResponse);
  }

  @Post('2fa/enable')
  @ApiBody({
    description: 'Enable two factor authentication',
    type: Enable2FADto,
  })
  @ApiResponse({ status: 200, description: TWO_FA_INITIATED })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  public async enable2FA(
    @Body() body: Enable2FADto,
    @Req() request: CustomRequest,
    @Res() response: Response
  ): Promise<any> {
    const { password } = body;
    const { sub: user_id } = request.user;
    const res = await this.authService.enable2FA(user_id, password);
    return response.status(res.status_code).send(res);
  }
}
