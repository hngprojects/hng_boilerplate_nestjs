import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_DOES_NOT_EXIST,
  INVALID_PASSWORD,
  TWO_FA_ENABLED,
  TWO_FA_INITIATED,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_NOT_FOUND,
  INVALID_REFRESH_TOKEN,
  UNAUTHORISED_TOKEN,
  INVALID_CREDENTIALS,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import UserService from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import appConfig from '../../../config/auth.config';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestSigninTokenDto } from './dto/request-signin-token.dto';
import { generateSixDigitToken } from '../../utils/generate-token';
import { OtpDto } from '../otp/dto/otp.dto';
import { LoginErrorResponseDto } from './dto/login-error-dto';
import { GoogleAuthService } from './google-auth.service';
import GoogleAuthPayload from './interfaces/GoogleAuthPayloadInterface';
import { GoogleVerificationPayloadInterface } from './interfaces/GoogleVerificationPayloadInterface';
import { SendEmailDto } from '../email/dto/email.dto';

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
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: USER_ACCOUNT_EXIST,
        };
      }

      await this.userService.createUser(creatUserDto);

      const user = await this.userService.getUserRecord({ identifier: creatUserDto.email, identifierType: 'email' });

      if (!user) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: FAILED_TO_CREATE_USER,
        };
      }

      const token = (await this.otpService.createOtp(user.id)).token;

      const emailData = new SendEmailDto();
      emailData.to = user.email;
      emailData.subject = 'Welcome to My App! confirm your Email';
      emailData.template = 'register-otp';
      emailData.context = { email: user.email, otp: token };
      await this.emailService.sendEmail(emailData);

      const responsePayload = {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          created_at: user.created_at,
        },
      };

      return {
        status_code: HttpStatus.CREATED,
        message: USER_CREATED_SUCCESSFULLY,
        data: responsePayload,
      };
    } catch (createNewUserError) {
      Logger.log('AuthenticationServiceError ~ createNewUserError ~', createNewUserError);
      throw new HttpException(
        {
          message: ERROR_OCCURED,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ status_code: number; message: string } | null> {
    try {
      const user = await this.userService.getUserRecord({ identifier: dto.email, identifierType: 'email' });
      if (!user) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          message: USER_ACCOUNT_DOES_NOT_EXIST,
        };
      }

      const token = (await this.otpService.createOtp(user.id)).token;

      const emailData = new SendEmailDto();
      emailData.to = dto.email;
      emailData.subject = 'Reset Password';
      emailData.template = 'reset-password';
      emailData.context = { link: `${process.env.BASE_URL}/auth/reset-password`, email: dto.email, token: token };
      await this.emailService.sendEmail(emailData);
      return {
        status_code: HttpStatus.OK,
        message: 'Email sent successfully',
      };
    } catch (forgotPasswordError) {
      Logger.log('AuthenticationServiceError ~ forgotPasswordError ~', forgotPasswordError);
      throw new HttpException(
        {
          message: ERROR_OCCURED,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async loginUser(loginDto: LoginDto): Promise<LoginResponseDto> {
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

      const access_token = this.jwtService.sign({ id: user.id });

      const responsePayload = {
        access_token,
        data: {
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            id: user.id,
          },
        },
      };

      return { message: 'Login successful', ...responsePayload };
    } catch (error) {
      Logger.log('AuthenticationServiceError ~ loginError ~', error);
      throw new HttpException(
        {
          message: 'An error occurred during login',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async validateUserAndPassword(user_id: string, password: string) {
    const user = await this.userService.getUserRecord({
      identifier: user_id,
      identifierType: 'id',
    });

    if (!user) {
      throw new HttpException(
        {
          status_code: HttpStatus.NOT_FOUND,
          message: USER_NOT_FOUND,
        },
        HttpStatus.NOT_FOUND,
        {
          cause: USER_NOT_FOUND,
        }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: INVALID_PASSWORD,
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: INVALID_PASSWORD,
        }
      );
    }

    if (user.is_2fa_enabled) {
      throw new HttpException(
        {
          status_code: HttpStatus.BAD_REQUEST,
          message: TWO_FA_ENABLED,
        },
        HttpStatus.BAD_REQUEST,
        {
          cause: TWO_FA_ENABLED,
        }
      );
    }

    return { user, isValid: true };
  }

  async enable2FA(user_id: string, password: string) {
    const { user, isValid, ...validationResponse } = await this.validateUserAndPassword(user_id, password);

    if (!isValid) {
      throw validationResponse;
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

  async generateRefreshToken(user: any) {
    return this.jwtService.sign(
      {
        id: user.id,
      },
      {
        secret: appConfig().jwtRefreshSecret,
        expiresIn: appConfig().jwtRefreshExpiry,
      }
    );
  }

  async generateAccessToken(user: any) {
    return this.jwtService.sign(
      {
        id: user.id,
      },
      {
        secret: appConfig().jwtSecret,
        expiresIn: appConfig().jwtExpiry,
      }
    );
  }

  async validateRefreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: appConfig().jwtRefreshSecret });
      return payload;
    } catch (e) {
      return null;
    }
  }

  async refreshAccessToken(refresh_token: string) {
    if (!refresh_token) {
      return {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Refresh token is required',
      };
    }

    const user = await this.validateRefreshToken(refresh_token);
    if (!user) {
      return {
        status_code: HttpStatus.UNAUTHORIZED,
        message: INVALID_REFRESH_TOKEN,
      };
    }
    const accessToken = await this.generateAccessToken(user);
    return {
      status_code: HttpStatus.OK,
      message: 'Access Token refreshed successfully',
      data: {
        access_token: accessToken,
      },
    };
  }

  async googleLogin(user: User) {
    const payload = { userId: user.id };
    const accessToken = this.jwtService.sign(payload);
  }

  async googleAuth(googleAuthPayload: GoogleAuthPayload) {
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
        status: 'success',
        message: 'User successfully created',
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

    // Generate a new OTP and save it
    const newOtp = generateSixDigitToken();
    await this.otpService.createOtp(user.id);

    // Send the OTP to the user's emailuser.email, newOtp
    const emailData = new SendEmailDto();
    emailData.to = user.email;
    emailData.subject = 'Welcome to My App! Confirm your Email';
    emailData.template = 'confirmation';
    emailData.context = { link: `remotebingo.com$?token=${newOtp}`, email: user.email };
    await this.emailService.sendEmail(emailData);

    return {
      message: 'Sign-in token sent to email',
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

    return {
      message: 'Sign-in successful',
      token: accessToken,
      status_code: HttpStatus.OK,
    };
  }
}
