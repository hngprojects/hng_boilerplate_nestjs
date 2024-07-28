import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException
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
  UNAUTHORISED_TOKEN,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { RequestSigninTokenDto } from './dto/request-signin-token.dto';
import { generateSixDigitToken } from '../../utils/generate-token';
import { OtpDto } from '../otp/dto/otp.dto';

@Injectable()
export default class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userService: UserService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private emailService: EmailService
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

      const accessToken = this.jwtService.sign({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        sub: user.id,
        user_type: user.user_type,
      });

      const responsePayload = {
        token: accessToken,
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

  private generateRandomBackupCode(numberOfCodes: number) {
    const [minNumber, maxNumber] = [111111, 999999];
    const codes = [];
    for (let index = 0; index < numberOfCodes; index++) {
      let repeatedCode = true;
      while (repeatedCode) {
        const code = Math.floor(Math.random() * (maxNumber - minNumber) + minNumber);
        if (codes.includes(code)) continue;
        codes[index] = code;
        repeatedCode = false;
      }
    }

    return codes;
  }

  async generateBackupCodes({ password, totp_code }, userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const passwordIsCorrect = bcrypt.compareSync(password, user.password);

      if (!passwordIsCorrect)
        throw new CustomHttpException(
          {
            status_code: HttpStatus.UNAUTHORIZED,
            error: 'Unauthorized',
            message: 'Authentication required',
          },
          HttpStatus.UNAUTHORIZED
        );

      if (!user.is_2fa_enabled) {
        throw new CustomHttpException(
          {
            status_code: HttpStatus.BAD_REQUEST,
            error: 'Invalid Request',
            message: '2-Factor Authentication has not been enabled',
          },
          HttpStatus.BAD_REQUEST
        );
      }

      if (user.totp_code !== totp_code) {
        throw new CustomHttpException(
          {
            status_code: HttpStatus.BAD_REQUEST,
            error: 'Invalid Request',
            message: 'TOTP code provided is invalid',
          },
          HttpStatus.BAD_REQUEST
        );
      }
      const backupCodes: number[] = this.generateRandomBackupCode(5);

      Object.assign(user, { backup_codes_2fa: JSON.stringify(backupCodes) });
      await this.userRepository.save(user);

      return {
        status_code: HttpStatus.OK,
        message: 'New backup codes generated',
        data: {
          backup_codes: backupCodes,
        },
      };
    } catch (error) {
      if (error instanceof CustomHttpException) throw error;

      Logger.log('AuthenticationServiceError ~ generateBackupCodeError ~', error);
      throw new HttpException(
        {
          message: 'An error occured while generating backup code',
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
      await this.emailService.sendForgotPasswordMail(dto.email, `${process.env.BASE_URL}/auth/reset-password`, token);
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
        throw new CustomHttpException(
          { message: 'Invalid password or email', error: 'Bad Request' },
          HttpStatus.UNAUTHORIZED
        );
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new CustomHttpException(
          { message: 'Invalid password or email', error: 'Bad Request' },
          HttpStatus.UNAUTHORIZED
        );
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
      if (error instanceof CustomHttpException) {
        throw error;
      }
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

  async requestSignInToken(requestSignInTokenDto: RequestSigninTokenDto) {
    const { email } = requestSignInTokenDto;

    const user = await this.userService.getUserRecord({ identifier: email, identifierType: 'email' });

    if (!user) {
      throw new BadRequestException({
        message: "Invalid credentials",
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

    // Send the OTP to the user's email
    await this.emailService.sendLoginOtp(user.email, newOtp);

    return {
      message: 'Sign-in token sent to email',
      status_code: HttpStatus.OK,
    };
  }

  async verifySignInToken(verifyOtp: OtpDto) {
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
    });

    return {
      message: 'Sign-in successful',
      token: accessToken,
      status_code: HttpStatus.OK,
    };
  }
}
