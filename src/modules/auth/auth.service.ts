import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import {
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_DOES_NOT_EXIST,
  INVALID_PASSWORD,
  TWO_FA_INITIATED,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_NOT_FOUND,
  UNAUTHORISED_TOKEN,
  INVALID_CREDENTIALS,
  LOGIN_SUCCESSFUL,
  LOGIN_ERROR,
  EMAIL_SENT,
  ENABLE_2FA_ERROR,
  USER_CREATED,
  SIGN_IN_OTP_SENT,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import UserService from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RequestSigninTokenDto } from './dto/request-signin-token.dto';
import { OtpDto } from '../otp/dto/otp.dto';
import { GoogleAuthService } from './google-auth.service';
import GoogleAuthPayload from './interfaces/GoogleAuthPayloadInterface';
import { GoogleVerificationPayloadInterface } from './interfaces/GoogleVerificationPayloadInterface';
import CustomExceptionHandler from '../../helpers/exceptionHandler';

@Injectable()
export default class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService,
    private googleAuthService: GoogleAuthService
  ) {}

  async createNewUser(creatUserDto: CreateUserDTO) {
    try {
      const userExists = await this.userService.getUserRecord({
        identifier: creatUserDto.email,
        identifierType: 'email',
      });

      if (userExists) {
        throw new BadRequestException({
          status_code: HttpStatus.BAD_REQUEST,
          message: USER_ACCOUNT_EXIST,
        });
      }

      await this.userService.createUser(creatUserDto);

      const user = await this.userService.getUserRecord({ identifier: creatUserDto.email, identifierType: 'email' });

      if (!user) {
        throw new BadRequestException({
          status_code: HttpStatus.BAD_REQUEST,
          message: FAILED_TO_CREATE_USER,
        });
      }

      const token = (await this.otpService.createOtp(user.id)).token;
      await this.emailService.sendUserEmailConfirmationOtp(user.email, token);

      const responsePayload = {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          created_at: user.created_at,
          avatar_url: user.profile.profile_pic_url,
          role: user.user_type,
        },
      };

      return {
        status_code: HttpStatus.CREATED,
        message: USER_CREATED_SUCCESSFULLY,
        data: responsePayload,
      };
    } catch (createNewUserError) {
      console.log('AuthenticationServiceError ~ createNewUserError ~', createNewUserError);
      CustomExceptionHandler(createNewUserError);
      throw new InternalServerErrorException('Error occured creating user');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ status_code: number; message: string } | null> {
    try {
      const user = await this.userService.getUserRecord({ identifier: dto.email, identifierType: 'email' });
      if (!user) {
        throw new BadRequestException({
          status_code: HttpStatus.BAD_REQUEST,
          message: USER_ACCOUNT_DOES_NOT_EXIST,
        });
      }

      const token = (await this.otpService.createOtp(user.id)).token;
      await this.emailService.sendForgotPasswordMail(dto.email, `${process.env.BASE_URL}/auth/reset-password`, token);
      return {
        status_code: HttpStatus.OK,
        message: EMAIL_SENT,
      };
    } catch (forgotPasswordError) {
      console.log('AuthenticationServiceError ~ forgotPasswordError ~', forgotPasswordError);
      CustomExceptionHandler(forgotPasswordError);

      throw new InternalServerErrorException('Error occured creating user');
    }
  }

  async loginUser(loginDto: LoginDto): Promise<LoginResponseDto | { status_code: number; message: string }> {
    try {
      const { email, password } = loginDto;

      const user = await this.userService.getUserRecord({
        identifier: email,
        identifierType: 'email',
      });

      if (!user) {
        throw new UnauthorizedException({
          status_code: HttpStatus.UNAUTHORIZED,
          message: INVALID_CREDENTIALS,
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new UnauthorizedException({
          status_code: HttpStatus.UNAUTHORIZED,
          message: INVALID_CREDENTIALS,
        });
      }

      const access_token = this.jwtService.sign({ id: user.id, sub: user.id });

      const responsePayload = {
        access_token,
        data: {
          user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.user_type,
            avatar_url: user.profile.profile_pic_url,
          },
        },
      };

      return { message: LOGIN_SUCCESSFUL, ...responsePayload };
    } catch (error) {
      console.log('AuthenticationServiceError ~ loginError ~', error);
      CustomExceptionHandler(error);
      throw new InternalServerErrorException({
        message: LOGIN_ERROR,
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private async validateUserAndPassword(user_id: string, password: string) {
    const user = await this.userService.getUserRecord({
      identifier: user_id,
      identifierType: 'id',
    });

    if (!user) {
      throw new NotFoundException({
        status_code: HttpStatus.NOT_FOUND,
        message: USER_NOT_FOUND,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException({
        status_code: HttpStatus.BAD_REQUEST,
        message: INVALID_PASSWORD,
      });
    }

    return { user, isValid: true };
  }

  async enable2FA(user_id: string, password: string) {
    const { user, isValid } = await this.validateUserAndPassword(user_id, password);

    if (!isValid) {
      throw new InternalServerErrorException(ENABLE_2FA_ERROR);
    }

    const secret = speakeasy.generateSecret({ length: 32 });
    const payload = {
      secret: secret.base32,
      is_2fa_enabled: true,
    };

    await this.userService.updateUserRecord({
      updatePayload: payload,
      identifierOptions: {
        identifierType: 'id',
        identifier: user.id,
      },
    });

    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `Hng:${user.email}`,
      issuer: 'Hng Boilerplate',
    });

    return {
      status_code: HttpStatus.OK,
      message: TWO_FA_INITIATED,
      data: {
        secret: secret.base32,
        qr_code_url: qrCodeUrl,
      },
    };
  }

  async googleAuth(googleAuthPayload: GoogleAuthPayload) {
    try {
      const idToken = googleAuthPayload.id_token;
      const verifyTokenResponse: GoogleVerificationPayloadInterface = await this.googleAuthService.verifyToken(idToken);
      const userEmail = verifyTokenResponse.email;
      const userExists = await this.userService.getUserRecord({ identifier: userEmail, identifierType: 'email' });

      if (!userExists) {
        const userCreationPayload = {
          email: userEmail,
          first_name: verifyTokenResponse.given_name || '',
          last_name: verifyTokenResponse?.family_name || '',
          password: '',
        };
        return await this.createUserGoogle(userCreationPayload);
      }
      const accessToken = await this.jwtService.sign({
        sub: userExists.id,
        id: userExists.id,
        email: userExists.email,
        first_name: userExists.first_name,
        last_name: userExists.last_name,
      });
      return {
        status: 'success',
        message: 'User authenticated successfully',
        access_token: accessToken,
        user: {
          id: userExists.id,
          email: userExists.email,
          first_name: userExists.first_name,
          last_name: userExists.last_name,
          fullname: userExists.first_name + ' ' + userExists.last_name,
          role: '',
        },
      };
    } catch (googleAuthenticationError) {
      console.log('AuthenticationServiceError ~ googleAuthenticationError ~', googleAuthenticationError);
      throw new InternalServerErrorException('Error occured authenticating User');
    }
  }

  public async createUserGoogle(userPayload: CreateUserDTO) {
    try {
      const newUser = await this.userService.createUser(userPayload);
      const accessToken = await this.jwtService.sign({
        sub: newUser.id,
        id: newUser.id,
        email: userPayload.email,
        first_name: userPayload.first_name,
        last_name: userPayload.last_name,
      });

      return {
        status_code: HttpStatus.OK,
        message: USER_CREATED,
        access_token: accessToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          fullname: newUser.first_name + ' ' + newUser.last_name,
          role: '',
        },
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(HttpStatus.BAD_REQUEST);
    }
  }

  async requestSignInToken(requestSignInTokenDto: RequestSigninTokenDto) {
    const { email } = requestSignInTokenDto;

    const user = await this.userService.getUserRecord({ identifier: email, identifierType: 'email' });

    if (!user) {
      throw new BadRequestException({
        message: 'Invalid credentials',
        status_code: HttpStatus.BAD_REQUEST,
      });
    }

    const otpExist = await this.otpService.findOtp(user.id);

    if (otpExist) {
      await this.otpService.deleteOtp(user.id);
    }

    const otp = await this.otpService.createOtp(user.id);

    await this.emailService.sendLoginOtp(user.email, otp.token);

    return {
      message: SIGN_IN_OTP_SENT,
      status_code: HttpStatus.OK,
    };
  }

  async verifyToken(verifyOtp: OtpDto) {
    const { token, email } = verifyOtp;

    const user = await this.userService.getUserRecord({ identifier: email, identifierType: 'email' });
    const otp = await this.otpService.verifyOtp(user.id, token);

    if (!user || !otp) {
      throw new UnauthorizedException({
        message: UNAUTHORISED_TOKEN,
        status_code: HttpStatus.UNAUTHORIZED,
      });
    }

    const accessToken = this.jwtService.sign({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      sub: user.id,
      id: user.id,
    });

    const { password, profile, ...data } = user;
    const responsePayload = {
      ...data,
      avatar_url: profile.profile_pic_url,
    };

    return {
      message: 'Sign-in successful',
      access_token: accessToken,
      user: responsePayload,
      status_code: HttpStatus.OK,
    };
  }
}
