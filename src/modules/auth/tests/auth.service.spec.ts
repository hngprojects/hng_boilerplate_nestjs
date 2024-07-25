import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ERROR_OCCURED, USER_ACCOUNT_EXIST, USER_CREATED_SUCCESSFULLY } from '../../../helpers/SystemMessages';
import { CreateUserDTO } from '../dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import AuthenticationService from '../auth.service';
import { SessionService } from '../../session/session.service';
import { Session } from '../../session/entities/session.entity';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Repository } from 'typeorm';

describe('Authentication Service tests', () => {
  let userService: UserService;
  let authService: AuthenticationService;
  let jwtService: JwtService;
  let sessionService: SessionService;
  let sessionRepository: Repository<Session>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthenticationService,
        UserService,
        {
          provide: getRepositoryToken(Session),
          useClass: Repository,
        },
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);
    sessionService = module.get<SessionService>(SessionService);
    sessionRepository = module.get<Repository<Session>>(getRepositoryToken(Session));
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

      const request: Partial<Request> = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        } as unknown as Record<string, string>,
      };

      const deviceInfo = {
        device_browser: 'Chrome',
        device_browser_version: '91.0.4472',
        device_os: 'Windows',
        device_os_version: '10.0.0',
        device_type: 'Other',
        device_brand: 'unknown',
        device_model: 'unknown',
      };

      const session: Session = {
        id: '9356e6a5-940f-4c48-b707-478319eb2a7b',
        userId: '1',
        device_browser: deviceInfo.device_browser,
        device_browser_version: deviceInfo.device_browser_version,
        device_os: deviceInfo.device_os,
        device_os_version: deviceInfo.device_os_version,
        device_type: deviceInfo.device_type,
        device_brand: deviceInfo.device_brand,
        device_model: deviceInfo.device_model,
      } as unknown as Session;

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt_token');
      jest.spyOn(sessionService, 'createSession').mockResolvedValue(session);

      const result = await authService.loginUser(loginDto, request as Request);

      expect(result).toEqual({
        message: 'Login successful',
        access_token: 'jwt_token',
        data: {
          user: {
            id: '1',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            last_login_device: deviceInfo,
          },
          session_id: session.id,
        },
      });
    });

    it('should throw an unauthorized error for invalid email', async () => {
      const request: Partial<Request> = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        } as unknown as Record<string, string>,
      };
      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'password123' };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      await expect(authService.loginUser(loginDto, request as Request)).rejects.toThrow(
        new CustomHttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw an unauthorized error for invalid password', async () => {
      const request: Partial<Request> = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        } as unknown as Record<string, string>,
      };

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

      await expect(authService.loginUser(loginDto, request as Request)).rejects.toThrow(
        new CustomHttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      const request: Partial<Request> = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        } as unknown as Record<string, string>,
      };

      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(userService, 'getUserRecord').mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.loginUser(loginDto, request as Request)).rejects.toThrow(
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
