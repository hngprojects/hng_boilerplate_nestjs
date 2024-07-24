import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_DOES_NOT_EXIST,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import UserService from '../user/user.service';
import { OtpService } from '../otp/otp.service';
import { EmailService } from '../email/email.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Injectable()
export default class AuthenticationService {
  constructor(
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
}
