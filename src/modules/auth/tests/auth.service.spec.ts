import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ERROR_OCCURED,
  INVALID_PASSWORD,
  TWO_FA_ENABLED,
  TWO_FA_INITIATED,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_NOT_FOUND,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_DOES_NOT_EXIST,
} from '../../../helpers/SystemMessages';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AuthenticationService from '../auth.service';
import { SessionService } from '../../session/session.service';
import { Session } from '../../session/entities/session.entity';
import UserService from '../../user/user.service';
import { OtpService } from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { User, UserType } from '../../user/entities/user.entity';
import { Otp } from '../../otp/entities/otp.entity';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { Repository } from 'typeorm';
import { Request } from 'express';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userServiceMock: jest.Mocked<UserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let otpServiceMock: jest.Mocked<OtpService>;
  let emailServiceMock: jest.Mocked<EmailService>;
  let sessionServiceMock: jest.Mocked<SessionService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUserRecord: jest.fn(),
            createUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            createOtp: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendForgotPasswordMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userServiceMock = module.get(UserService) as jest.Mocked<UserService>;
    jwtServiceMock = module.get(JwtService) as jest.Mocked<JwtService>;
    otpServiceMock = module.get(OtpService) as jest.Mocked<OtpService>;
    emailServiceMock = module.get(EmailService) as jest.Mocked<EmailService>;
    sessionServiceMock = module.get(SessionService) as jest.Mocked<SessionService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewUser', () => {
    const createUserDto: CreateUserDTO = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'John',
      last_name: 'Doe',
    };

    const mockUser: Partial<User> = {
      id: '1',
      email: createUserDto.email,
      first_name: createUserDto.first_name,
      last_name: createUserDto.last_name,
      created_at: new Date(),
      user_type: UserType.USER,
      is_active: true,
      attempts_left: 3,
      time_left: 0,
    };

    it('should create a new user successfully', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);
      userServiceMock.createUser.mockResolvedValueOnce(undefined);
      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);
      jwtServiceMock.sign.mockReturnValueOnce('mocked_token');

      const result = await service.createNewUser(createUserDto);

      expect(result).toEqual({
        status_code: HttpStatus.CREATED,
        message: USER_CREATED_SUCCESSFULLY,
        data: {
          token: 'mocked_token',
          user: {
            first_name: createUserDto.first_name,
            last_name: createUserDto.last_name,
            email: createUserDto.email,
            created_at: expect.any(Date),
          },
        },
      });
    });

    it('should return error if user already exists', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);

      const result = await service.createNewUser(createUserDto);

      expect(result).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: USER_ACCOUNT_EXIST,
      });
    });

    it('should return error if user creation fails', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);
      userServiceMock.createUser.mockResolvedValueOnce(undefined);
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);

      const result = await service.createNewUser(createUserDto);

      expect(result).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: FAILED_TO_CREATE_USER,
      });
    });

    it('should throw HttpException on unexpected error', async () => {
      userServiceMock.getUserRecord.mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.createNewUser(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('loginUser', () => {
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
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
      };

      const deviceInfo = {
        device_browser: 'Chrome',
        device_browser_version: '126.0.0',
        device_os: 'Linux',
        device_os_version: '0.0.0',
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

      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtServiceMock.sign.mockReturnValue('jwt_token');
      jest.spyOn(sessionServiceMock, 'createSession').mockResolvedValue(session);

      const result = await service.loginUser(loginDto, request as Request);

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
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
      };

      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'password123' };

      userServiceMock.getUserRecord.mockResolvedValue(null);

      await expect(service.loginUser(loginDto, request as Request)).rejects.toThrow(
        new CustomHttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should throw an unauthorized error for invalid password', async () => {
      const request: Partial<Request> = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
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

      userServiceMock.getUserRecord.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.loginUser(loginDto, request as Request)).rejects.toThrow(
        new CustomHttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      const request: Partial<Request> = {
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        },
      };

      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };

      userServiceMock.getUserRecord.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.loginUser(loginDto, request as Request)).rejects.toThrow(
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

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    beforeEach(() => {
      process.env.BASE_URL = 'http://example.com';
    });

    it('should send reset password email successfully', async () => {
      const mockUser: Partial<User> = { id: '1', email };
      const mockOtp: Otp = {
        id: '1',
        token: '123456',
        expiry: new Date(Date.now() + 3600000), // 1 hour from now
        user: mockUser as User,
        user_id: '1',
        created_at: new Date(),
        updated_at: new Date(),
      };

      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);
      otpServiceMock.createOtp.mockResolvedValueOnce(mockOtp);
      emailServiceMock.sendForgotPasswordMail.mockResolvedValueOnce(undefined);

      const result = await service.forgotPassword({ email });

      expect(emailServiceMock.sendForgotPasswordMail).toHaveBeenCalledWith(
        email,
        'http://example.com/auth/reset-password',
        '123456'
      );
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: 'Email sent successfully',
      });
    });

    it('should return error if user not found', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);

      const result = await service.forgotPassword({ email });

      expect(result).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: USER_ACCOUNT_DOES_NOT_EXIST,
      });
    });

    it('should throw HttpException on unexpected error', async () => {
      userServiceMock.getUserRecord.mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.forgotPassword({ email })).rejects.toThrow(HttpException);
    });
  });
});

describe('Enabling two factor authentication', () => {
  let userService: UserService;
  let authService: AuthenticationService;
  let sessionService: SessionService;
  let otpService: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthenticationService,
        UserService,
        SessionService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Session),
          useValue: {},
        },
        {
          provide: OtpService,
          useValue: {
            createOtp: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendForgotPasswordMail: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    sessionService = module.get<SessionService>(SessionService);
    otpService = module.get<OtpService>(OtpService);
  });

  it('should return NOT FOUND if user does not exists', async () => {
    const user_id = 'another-uuid-value-over-here';
    const password = 'password';

    const existingRecord = null;
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);
    await expect(authService.enable2FA(user_id, password)).rejects.toThrow(
      new HttpException(
        {
          message: USER_NOT_FOUND,
          status_code: HttpStatus.NOT_FOUND,
        },
        HttpStatus.NOT_FOUND
      )
    );
  });

  it('should return INVALID PASSWORD if user enters a wrong password', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'abc';

    const existingRecord = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: await bcrypt.hash('password', 10),
      id: 'some-uuid-value-here',
    };
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);

    await expect(authService.enable2FA(user_id, password)).rejects.toThrow(
      new HttpException(
        {
          message: INVALID_PASSWORD,
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      )
    );
  });

  it('should return 2FA ALREADY ENABLED if user tries to enable 2fa when enabled', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'password';

    const existingRecord = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: await bcrypt.hash('password', 10),
      secret: 'secret',
      is_2fa_enabled: true,
      id: 'some-uuid-value-here',
    };
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);

    await expect(authService.enable2FA(user_id, password)).rejects.toThrow(
      new HttpException(
        {
          message: TWO_FA_ENABLED,
          status_code: HttpStatus.BAD_REQUEST,
        },
        HttpStatus.BAD_REQUEST
      )
    );
  });

  it('should enable 2FA and return secret and QR code URL for a valid user', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'password123';

    const existingRecord = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: await bcrypt.hash('password123', 10),
      is_2fa_enabled: false,
      id: 'some-uuid-value-here',
    };
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);

    const secret = speakeasy.generateSecret({ length: 32 });
    jest.spyOn(speakeasy, 'generateSecret').mockReturnValue(secret);
    jest.spyOn(userService, 'updateUserRecord').mockResolvedValueOnce(undefined);

    const expectedResponse = {
      status_code: HttpStatus.OK,
      message: TWO_FA_INITIATED,
      data: {
        secret: secret.base32,
        qr_code_url: speakeasy.otpauthURL({
          secret: secret.ascii,
          label: `Hng:${existingRecord.email}`,
          issuer: 'Hng Boilerplate',
        }),
      },
    };

    const res = await authService.enable2FA(user_id, password);
    expect(res).toEqual(expectedResponse);
  });

  it('should handle errors gracefully', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'password';

    jest.spyOn(userService, 'getUserRecord').mockRejectedValueOnce(new Error('Database connection error'));

    await expect(authService.enable2FA(user_id, password)).rejects.toThrow(
      new HttpException(
        {
          message: 'Database connection error',
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    );
  });
});
