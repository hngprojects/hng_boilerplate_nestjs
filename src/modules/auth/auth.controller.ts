import { Body, Controller, HttpCode, HttpStatus, Post, Request, Res } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export default class RegistrationController {
  constructor(
    private authService: AuthenticationService,
  ) { }

  @skipAuth()
  @Post("register")
  public async register(@Body() body: CreateUserDTO, @Res() response: Response): Promise<any> {
    const createUserResponse = await this.authService.createNewUser(body)
    return response.status(createUserResponse.status_code).send(createUserResponse)
  }

  @skipAuth()
  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }
}