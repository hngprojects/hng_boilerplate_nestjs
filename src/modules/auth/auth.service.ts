import { Repository } from 'typeorm';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../helpers/SystemMessages';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/entities/user.entity';
import UserService from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CustomHttpException } from '../../helpers/custom-http-filter';

@Injectable()
export default class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
        return {
          status_code: HttpStatus.UNAUTHORIZED,
          error: 'Unauthorized',
          message: 'Authentication required',
        };

      if (!user.is_2fa_enabled) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          error: 'Invalid Request',
          message: '2-Factor Authentication has not been enabled',
        };
      }

      if (user.totp_code !== totp_code) {
        return {
          status_code: HttpStatus.BAD_REQUEST,
          error: 'Invalid Request',
          message: 'TOTP code provided is invalid',
        };
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
      return {
        status_code: HttpStatus.BAD_REQUEST,
        error: 'Invalid request',
        message: 'The request sent was invalid.',
      };
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
}
