import { Body, Controller, HttpStatus, Post, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';

@Controller('auth/register')
export default class RegistrationController {
  constructor(
    private authService: AuthenticationService,
  ) { }

  @skipAuth()
  @Post()
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body)
    return response.status(createUserResponse.status_code).send(createUserResponse)
  }
}
