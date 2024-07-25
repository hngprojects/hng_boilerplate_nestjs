import { Body, Controller, HttpCode, HttpStatus, Post, Request, Req, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BackupCodesReqBodyDTO } from './dto/backup-codes-req-body.dto';

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

  @skipAuth()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.loginUser(loginDto);
  }

  @Post('/2fa/backup-codes')
  @HttpCode(200)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate backup codes for 2 factor authenticaton' })
  @ApiResponse({ status: 200, description: 'New backup codes generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid or Bad Request' })
  async generateBackupCodes(
    @Body() backupCodesReqBodyDTO: BackupCodesReqBodyDTO,
    @Req() request,
    @Res() response: Response
  ): Promise<any> {
    const userId: string = request.user.sub;
    const generatedResult = await this.authService.generateBackupCodes(backupCodesReqBodyDTO, userId);
    return response.status(generatedResult.status_code).send(generatedResult);
  }
}
