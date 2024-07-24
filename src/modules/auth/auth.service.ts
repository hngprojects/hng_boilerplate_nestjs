import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import UserService from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';
import { SessionService } from '../session/session.service';
import { CreateSessionDto } from '../session/dto/create-session.dto';
import * as useragent from 'useragent';
import { Request } from 'express';

@Injectable()
export default class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private sessionService: SessionService
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

  async loginUser(loginDto: LoginDto, request: Request): Promise<LoginResponseDto> {
    try {
      const { email, password } = loginDto;
      const userAgentString = request.headers['user-agent'] || '';
      const deviceInfo = this.parseUserAgent(userAgentString);

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

      const createSessionDto: CreateSessionDto = {
        user_id: user.id,
        ...deviceInfo,
        expires_at: new Date(Date.now() + 3600 * 1000),
      };

      const session = await this.sessionService.createSession(createSessionDto);

      const responsePayload = {
        access_token,
        data: {
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            id: user.id,
            last_login_device: deviceInfo,
          },
          session_id: session.id,
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

  private parseUserAgent(userAgentString: string) {
    const agent = useragent.parse(userAgentString || '');

    return {
      device_browser: agent.family || 'unknown',
      device_browser_version: agent.toVersion() || 'unknown',
      device_os: agent.os.family || 'unknown',
      device_os_version: agent.os.toVersion() || 'unknown',
      device_type: agent.device.family || 'unknown',
      device_brand: agent.device.brand || 'unknown',
      device_model: agent.device.model || 'unknown',
    };
  }
}
