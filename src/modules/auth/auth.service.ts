import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  INCORRECT_TOTP_CODE,
  TWO_FACTOR_VERIFIED_SUCCESSFULLY,
  USER_ACCOUNT_DOES_NOT_EXIST,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import UserService from '../user/user.service';
import * as speakeasy from 'speakeasy';
import { Verify2FADto } from './dto/verify-2fa.dto';

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

  generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 5; i++) {
      codes.push(Math.floor(10000000 + Math.random() * 90000000).toString());
    }
    return codes;
  }

  async verify2fa(verify2faDto: Verify2FADto, user_id: string) {
    const user = await this.userService.getUserRecord({ identifier: user_id, identifierType: 'id' });
    if (!user) {
      return {
        status_code: HttpStatus.NOT_FOUND,
        message: USER_ACCOUNT_DOES_NOT_EXIST,
      };
    }

    // check if totp code is valid
    const verify = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: verify2faDto.totp_code,
    });
    if (!verify) {
      throw new BadRequestException({
        status_code: HttpStatus.BAD_REQUEST,
        message: INCORRECT_TOTP_CODE,
      });
    }

    // generate, hash and store backup codes
    const codes = this.generateBackupCodes();
    user.backup_codes = codes;

    // update two factor status to true
    user.is_two_factor_enabled = true;

    await this.userService.saveUser(user);
    return {
      status_code: HttpStatus.OK,
      message: TWO_FACTOR_VERIFIED_SUCCESSFULLY,
      data: { backup_codes: codes },
    };
  }
}
