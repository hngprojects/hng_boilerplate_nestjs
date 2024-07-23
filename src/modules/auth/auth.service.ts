import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { CustomHttpException } from 'src/helpers/custom-http-filter';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import UserService from '../user/user.service';

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

async login(loginDto: LoginDto): Promise<LoginResponseDto> {
  try {
    const { email, password } = loginDto;

    const user = await this.userService.getUserRecord({
      identifier: email,
      identifierType: 'email',
    });

    if (!user)
      throw new CustomHttpException(
        { message: 'Invalid password or email', error: 'Bad Request' },
        HttpStatus.UNAUTHORIZED
      );

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      throw new CustomHttpException(
        { message: 'Invalid password or email', error: 'Bad Request' },
        HttpStatus.UNAUTHORIZED
      );

    const access_token = this.jwtService.sign({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      sub: user.id,
    });

    const responsePayload = {
      access_token,
      data: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          id: user.id,
        }
      }

    return { message: 'Login successful', ...responsePayload };

  } catch (loginError) {
      Logger.log('AuthenticationServiceError ~ passwordloginError ~', loginError);
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
