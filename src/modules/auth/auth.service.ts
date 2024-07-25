import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_BANNED,
  USER_NOT_FOUND,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import UserService from '../user/user.service';
import { LoginUserDTO } from './dto/login-user.dto';

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

  async loginUser(body: LoginUserDTO): Promise<any> {
    try {
      const user = await this.userService.getUserRecord({ identifier: body.email, identifierType: 'email' });
      if (!user) {
        throw new HttpException({ message: USER_NOT_FOUND, status_code: HttpStatus.NOT_FOUND }, HttpStatus.NOT_FOUND);
      }

      const isPasswordValid = await this.userService.validatePassword(user.password, body.password);

      if (!isPasswordValid) {
        user.attempts_left -= 1;
        if (user.attempts_left <= 0) {
          user.attempts_left = 0;
          await this.userService.updateUserAttempts(user.id, user.attempts_left, user.time_left);

          const oneHourAgo = new Date(Date.now() - 5 * 60 * 1000);
          if (user.time_left && new Date(user.time_left) > oneHourAgo) {
            return { message: USER_BANNED, status_code: HttpStatus.FORBIDDEN };
          }
          user.time_left = new Date();
        }

        await this.userService.updateUserAttempts(user.id, user.attempts_left, user.time_left);

        return { message: 'Invalid credentials', status_code: HttpStatus.UNAUTHORIZED };
      }

      await this.userService.updateUserAttempts(user.id, 3, new Date());
      const accessToken = this.jwtService.sign({ userId: user.id });

      return {
        status_code: HttpStatus.OK,
        message: 'Login successfull',
        data: { token: accessToken },
      };
    } catch (loginError) {
      Logger.log('AuthenticationServiceError ~ loginError ~', loginError);
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
