import { Body, Controller, HttpCode, HttpStatus, Post, Req, Request, Res, UseGuards, Get } from '@nestjs/common';
import { Response } from 'express';
import { CreateUserDTO } from './dto/create-user.dto';
import { skipAuth } from '../../helpers/skipAuth';
import AuthenticationService from './auth.service';
import { ForgotPasswordDto, ForgotPasswordResponseDto } from './dto/forgot-password.dto';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { BAD_REQUEST, TWO_FA_INITIATED } from '../../helpers/SystemMessages';
import { Enable2FADto } from './dto/enable-2fa.dto';
import { AuthGuard } from '@nestjs/passport';
import { OtpDto } from '../otp/dto/otp.dto';
import { RequestSigninTokenDto } from './dto/request-signin-token.dto';
import UserService from '../user/user.service';

@ApiTags('Authentication')
@Controller('auth')
export default class RegistrationController {
  constructor(
    private authService: AuthenticationService,
    private userService: UserService
  ) {}

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
  @Get('login/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // Initiates Google OAuth2 login flow
  }

  @skipAuth()
  @Get('callback/google')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req['user'];
    if (user) {
      const jwt = await this.authService.googleLogin(user);
      const userExists = await this.userService.getUserRecord({ identifierType: 'email', identifier: user.email });

      if (!userExists) {
        const newUser = await this.authService.createUserGoogle(user);
        return res.status(HttpStatus.CREATED).json(newUser);
      }

      const response = {
        status: 'success',
        message: 'User successfully authenticated',
        data: {
          tokens: {
            access_token: jwt.access_token,
          },
          user: {
            id: user.id,
            email: user.email,
            name: `${user.given_name} ${user.family_name}`,
            given_name: user.given_name,
            family_name: user.family_name,
            picture: user.picture,
          },
        },
      };

      return res.status(HttpStatus.OK).json(response);
    } else {
      const response = {
        status: 'error',
        message: 'Authentication failed',
      };

      return res.status(HttpStatus.UNAUTHORIZED).json(response);
    }
  }

  @skipAuth()
  @Get('registration/google')
  @UseGuards(AuthGuard('google'))
  async googleRegistrationRedirect(@Req() req: Request, @Res() res: Response) {
    console.log('Registration auth');
    const user = req['user'];
    if (user) {
      const userRegistered = await this;
      const jwt = await this.authService.googleLogin(user);

      const response = {
        status: 'success',
        message: 'User successfully authenticated',
        data: {
          tokens: {
            access_token: jwt.access_token,
          },
          user: {
            id: user.id,
            email: user.email,
            name: `${user.given_name} ${user.family_name}`,
            given_name: user.given_name,
            family_name: user.family_name,
            picture: user.picture,
          },
        },
      };

      return res.status(HttpStatus.OK).json(response);
    } else {
      const response = {
        status: 'error',
        message: 'Authentication failed',
      };

      return res.status(HttpStatus.UNAUTHORIZED).json(response);
    }
  }

  @Post('magic-link')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request Signin Token' })
  @ApiResponse({ status: 200, description: 'Sign-in token sent to email', type: RequestSigninTokenDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  public async signInToken(@Body() body: RequestSigninTokenDto) {
    return await this.authService.requestSignInToken(body);
  }

  @Post('magic-link/verify')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify Signin Token' })
  @ApiResponse({ status: 200, description: 'Sign-in successful', type: OtpDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  public async verifySignInToken(@Body() body: OtpDto) {
    return await this.authService.verifySignInToken(body);
  }
}
