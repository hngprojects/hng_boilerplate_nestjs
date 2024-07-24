import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { Verify2FADto } from './dto/verify-2fa.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { INCORRECT_TOTP_CODE, TWO_FACTOR_VERIFIED_SUCCESSFULLY } from '../../helpers/SystemMessages';

@Controller('auth')
export default class RegistrationController {
  constructor(private authService: AuthenticationService) {}

  @skipAuth()
  @Post('register')
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body);
    return response.status(createUserResponse.status_code).send(createUserResponse);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify two factor authentication code' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: TWO_FACTOR_VERIFIED_SUCCESSFULLY,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: INCORRECT_TOTP_CODE,
  })
  @Post('2fa/verify')
  verify2fa(@Body() verify2faDto: Verify2FADto, @Req() req) {
    return this.authService.verify2fa(verify2faDto, req.user.sub);
  }
}
