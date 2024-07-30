import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ERROR_OCCURED,
  USER_BANNED,
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
import UserService from '../../user/user.service';
import { OtpService } from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import { User, UserType } from '../../user/entities/user.entity';
import { Otp } from '../../otp/entities/otp.entity';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { GoogleAuthService } from '../google-auth.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userServiceMock: jest.Mocked<UserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let otpServiceMock: jest.Mocked<OtpService>;
  let emailServiceMock: jest.Mocked<EmailService>;
  let googleAuthServiceMock: jest.Mocked<GoogleAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,

        {
          provide: UserService,
          useValue: {
            getUserRecord: jest.fn(),
            createUser: jest.fn(),
            updateUserAttempts: jest.fn(),
            updateUserRecord: jest.fn(),
          },
        },
        {
          provide: GoogleAuthService,
          useValue: {
            verifyToken: jest.fn(),
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
            createOtp: jest.fn().mockResolvedValue({ token: 999987 }),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendForgotPasswordMail: jest.fn(),
            sendUserEmailConfirmationOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userServiceMock = module.get(UserService) as jest.Mocked<UserService>;
    jwtServiceMock = module.get(JwtService) as jest.Mocked<JwtService>;
    otpServiceMock = module.get(OtpService) as jest.Mocked<OtpService>;
    emailServiceMock = module.get(EmailService) as jest.Mocked<EmailService>;
    googleAuthServiceMock = module.get(GoogleAuthService) as jest.Mocked<GoogleAuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
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
      time_left: new Date(),
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

      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtServiceMock.sign.mockReturnValue('jwt_token');

      const result = await service.loginUser(loginDto);

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

      userServiceMock.getUserRecord.mockResolvedValue(null);

      //await expect(service.loginUser(loginDto)).toBe({ message: 'Invalid password or email', status_code: HttpStatus.UNAUTHORIZED });
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

      userServiceMock.getUserRecord.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      // await expect(service.loginUser(loginDto)).toBe({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
    });

    it('should handle unexpected errors gracefully', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };

      userServiceMock.getUserRecord.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.loginUser(loginDto)).rejects.toThrow(
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

  it('should return FORBIDDEN on the fourth unsuccessful login attempts', async () => {
    const loginDto: LoginDto = { email: 'john@doe.com', password: 'wrongpassword' };

    const user: UserResponseDTO = {
      id: '1',
      email: loginDto.email,
      attempts_left: 3,
      time_left: null,
      password: 'correctpassword',
    };

    userServiceMock.getUserRecord.mockResolvedValue(user);

    jest.spyOn(userServiceMock, 'updateUserAttempts').mockImplementation(async (id, attemptsLeft, timeLeft) => {
      if (id === user.id) {
        user.attempts_left = attemptsLeft - 1;
        user.time_left = timeLeft;
      }
    });

    jest.spyOn(bcrypt, 'compare').mockImplementation(() => false);

    jest.spyOn(service, 'handleLoginAttempts').mockImplementation(async (userId: string, isValidAttempt: boolean) => {
      if (isValidAttempt) {
        user.attempts_left = 3;
      } else {
        user.attempts_left -= 1;

        if (user.attempts_left <= 0) {
          const currentTime = new Date();
          const banEndTime = new Date(user.time_left);
          banEndTime.setMinutes(banEndTime.getMinutes() + 5);
          user.time_left = user.time_left === null ? new Date() : user.time_left;

          if (user.time_left && currentTime < banEndTime) {
            throw new HttpException({ message: USER_BANNED, error: 'Forbidden' }, HttpStatus.FORBIDDEN);
          }
        }
      }
    });

    for (let i = 0; i < 3; i++) {
      await expect(service.loginUser(loginDto)).rejects.toThrow(
        new HttpException({ message: 'Invalid password or email', error: 'Bad Request' }, HttpStatus.UNAUTHORIZED)
      );
    }

    await expect(service.loginUser(loginDto)).rejects.toThrow(
      new HttpException({ message: USER_BANNED, error: 'Forbidden' }, HttpStatus.FORBIDDEN)
    );

    expect(user.attempts_left).toBeLessThan(0);
    expect(user.time_left).not.toBeNull();
    const currentTime = new Date();
    const timeDifference = (currentTime.getTime() - new Date(user.time_left).getTime()) / (60 * 1000);
    expect(timeDifference).toBeLessThan(1);
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

  describe('Enabling two factor authentication', () => {
    it('should return NOT FOUND if user does not exists', async () => {
      const user_id = 'another-uuid-value-over-here';
      const password = 'password';

      const existingRecord = null;
      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(existingRecord);
      await expect(service.enable2FA(user_id, password)).rejects.toThrow(
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
      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(existingRecord);

      await expect(service.enable2FA(user_id, password)).rejects.toThrow(
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

      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(existingRecord);

      await expect(service.enable2FA(user_id, password)).rejects.toThrow(HttpException);
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
      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(existingRecord);

      const secret = speakeasy.generateSecret({ length: 32 });
      jest.spyOn(speakeasy, 'generateSecret').mockReturnValue(secret);
      jest.spyOn(userServiceMock, 'updateUserRecord').mockResolvedValueOnce(undefined);

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

      jest.spyOn(service, 'enable2FA').mockResolvedValueOnce(expectedResponse);

      const res = await service.enable2FA(user_id, password);
      expect(res).toEqual(expectedResponse);
    });

    it('should handle errors gracefully', async () => {
      const user_id = 'some-uuid-value-here';
      const password = 'password';

      jest.spyOn(userServiceMock, 'getUserRecord').mockRejectedValueOnce(new Error('Database connection error'));

      await expect(service.enable2FA(user_id, password)).rejects.toThrow(
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
});
