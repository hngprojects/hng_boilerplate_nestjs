import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  INVALID_PASSWORD,
  TWO_FA_ENABLED,
  TWO_FA_INITIATED,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_NOT_FOUND,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import UserService from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';

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
}
