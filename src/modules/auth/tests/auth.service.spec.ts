import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ERROR_OCCURED,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_NOT_FOUND,
} from '../../../helpers/SystemMessages';
import { CreateUserDTO } from '../dto/create-user.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import AuthenticationService from '../auth.service';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as bcrypt from 'bcryptjs';
import OtpService from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { Otp } from '../../otp/entities/otp.entity';
import { RequestSigninTokenDto } from '../dto/request-signin-token.dto';

describe('Authentication Service tests', () => {
  let userService: UserService;
  let authService: AuthenticationService;
  let jwtService: JwtService;
  let otpService: OtpService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthenticationService,
        UserService,
        OtpService,
        EmailService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: {},
        },
      ],
    })
      .overrideProvider(EmailService)
      .useValue({ serv: () => {} })
      .compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OtpService>(OtpService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('createNewUser tests', () => {
    it('Registration Controller should be defined', () => {
      expect(authService).toBeDefined();
    });

    it('should return BAD_REQUEST if user already exists', async () => {
      const body: CreateUserDTO = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password',
      };
      const existingRecord: UserResponseDTO = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        is_active: true,
        id: 'some-uuid-value-here',
        attempts_left: 2,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);
      const newUserResponse = await authService.createNewUser(body);
      expect(newUserResponse).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: USER_ACCOUNT_EXIST,
      });
    });

    it('should return CREATED and user data if registration is successful', async () => {
      const body: CreateUserDTO = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password: 'password',
      };
      const user: UserResponseDTO = {
        id: '1',
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        attempts_left: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const accessToken = 'fake-jwt-token';

      jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(null);
      jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue(accessToken);
      jest.spyOn(userService, 'createUser').mockResolvedValueOnce(null);

      const newUserResponse = await authService.createNewUser(body);

      user.created_at = newUserResponse.data.user.created_at;

      expect(newUserResponse).toEqual({
        status_code: HttpStatus.CREATED,
        message: USER_CREATED_SUCCESSFULLY,
        data: {
          token: accessToken,
          user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            created_at: user.created_at,
          },
        },
      });
    });

    it('should return INTERNAL_SERVER_ERROR on exception', async () => {
      const body: CreateUserDTO = { email: 'john@doe.com', first_name: 'John', last_name: 'Doe', password: 'password' };

      await expect(authService.createNewUser(body)).rejects.toEqual(
        new HttpException(
          {
            message: ERROR_OCCURED,
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });

  describe('loginUser tests', () => {
    it('should return login response if credentials are valid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const user: UserResponseDTO = {
        id: '1',
        email: loginDto.email,
        first_name: 'Test',
        last_name: 'User',
        password: await bcrypt.hash('password123', 10),
        is_active: true,
        attempts_left: 2,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');

      const result = await authService.loginUser(loginDto);

      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'jwt_token',
        data: {
          user: {
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            id: '1',
          },
        },
      });
    });

    it('should throw an unauthorized error for invalid email', async () => {
      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'password123' };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        new CustomHttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw an unauthorized error for invalid password', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const user: UserResponseDTO = {
        id: '1',
        email: loginDto.email,
        first_name: 'Test',
        last_name: 'User',
        password: await bcrypt.hash('password123', 10),
        is_active: true,
        attempts_left: 2,
        created_at: new Date(),
        updated_at: new Date(),
      };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        new CustomHttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(userService, 'getUserRecord').mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.loginUser(loginDto)).rejects.toThrow(
        new HttpException(
          {
            message: 'An error occurred during login',
            status_code: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      );
    });
  });
});
