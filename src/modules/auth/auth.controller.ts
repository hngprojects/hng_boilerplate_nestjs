import { Body, Controller, HttpCode, HttpStatus, Post, Request, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { BAD_REQUEST, TWO_FA_INITIATED, BACKUP_CODES_GENERATED, UNAUTHORIZED } from '../../helpers/SystemMessages';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BackupCodesReqBodyDTO } from './dto/backup-codes-req-body.dto';

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
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.loginUser(loginDto);
  }

  @Post('/2fa/backup-codes')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate backup codes for 2 factor authenticaton' })
  @ApiResponse({ status: 200, description: BACKUP_CODES_GENERATED })
  @ApiResponse({ status: 401, description: UNAUTHORIZED })
  @ApiResponse({ status: 400, description: BAD_REQUEST })
  async generateBackupCodes(@Body() backupCodesReqBodyDTO: BackupCodesReqBodyDTO, @Req() request): Promise<any> {
    const userId: string = request.user.sub;
    return this.authService.generateBackupCodes(backupCodesReqBodyDTO, userId);
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
}
