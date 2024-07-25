import { Body, Controller, HttpCode, HttpStatus, Post, Req, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from './dto/forgot-password.dto';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BAD_REQUEST, TWO_FA_INITIATED } from '../../helpers/SystemMessages';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentication')
@Controller('auth')
export default class RegistrationController {
  constructor(private authService: AuthenticationService) {}

  @skipAuth()
  @Post('register')
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body);
    return response.status(createUserResponse.status_code).send(createUserResponse);
  }

  @ApiOperation({ summary: 'Generate forgot password reset token' })
  @ApiResponse({
    status: 200,
    description: 'The forgot password reset token generated successfully',
    type: ForgotPasswordResponseDto,
  })
  @skipAuth()
  @HttpCode(200)
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Res() response: Response): Promise<any> {
    return await this.authService.forgotPassword(forgotPasswordDto);
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

  @Post('2fa/enable')
  @ApiBody({
    description: 'Enable two factor authentication',
    type: Enable2FADto,
  })
  @ApiResponse({ status: 200, description: TWO_FA_INITIATED })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  public async enable2FA(@Body() body: Enable2FADto, @Req() request: Request): Promise<any> {
    const { password } = body;
    const { id: user_id } = request['user'];
    return this.authService.enable2FA(user_id, password);
  }

  @skipAuth()
  @Post('password-reset-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Send password reset email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  async sendPasswordResetEmail(@Body('email') email: string, @Res() response: Response): Promise<any> {
    const passwordReset = await this.authService.sendPasswordResetEmail(email);
    return response.status(passwordReset.status_code).send(passwordReset);
  }
}
