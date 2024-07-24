import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { INCORRECT_TOTP_CODE, TWO_FACTOR_VERIFIED_SUCCESSFULLY } from '../../helpers/SystemMessages';
import { Body, Controller, HttpCode, HttpStatus, Post, Req, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2FADto } from './dto/verify-2fa.dto';

@ApiTags('auth')
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

  @skipAuth()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.loginUser(loginDto);
  }
}
