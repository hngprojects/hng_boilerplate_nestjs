import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  INVALID_REFRESH_TOKEN,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import UserService from '../user/user.service';
import appConfig from '../../../config/auth.config';

@Injectable()
export default class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
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
      const refreshToken = await this.generateRefreshToken(user);

      const responsePayload = {
        accessToken: accessToken,
        refresh_token: refreshToken,
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
}
