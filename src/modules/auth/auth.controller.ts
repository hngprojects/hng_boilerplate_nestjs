import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { BackupCodesReqBodyDTO } from './dto/backup-codes-req-body.dto';

@Controller('auth')
export default class RegistrationController {
  constructor(private authService: AuthenticationService) {}

  @skipAuth()
  @Post('register')
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body);
    return response.status(createUserResponse.status_code).send(createUserResponse);
  }

  @Post('/2fa/backup-codes')
  async generateBackupCodes(
    @Body() backupCodesReqBodyDTO: BackupCodesReqBodyDTO,
    @Req() request,
    @Res() response: Response
  ): Promise<any> {
    const userId: string = request.user.sub;
    const generateBackupCodesResponse = await this.authService.generateBackupCodes(backupCodesReqBodyDTO, userId);
    return response.status(generateBackupCodesResponse.status_code).send(generateBackupCodesResponse);
  }
}
