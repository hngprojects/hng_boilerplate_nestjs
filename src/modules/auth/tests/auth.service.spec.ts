import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import { Test, TestingModule } from '@nestjs/testing';
import * as SYS_MSG from '../../../helpers/SystemMessages';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AuthenticationService from '../auth.service';
import { Verify2FADto } from '../dto/verify-2fa.dto';
import UserService from '../../user/user.service';
import { OtpService } from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { User, UserType } from '../../user/entities/user.entity';
import { Otp } from '../../otp/entities/otp.entity';
import UserResponseDTO from '../../user/dto/user-response.dto';
import { LoginDto } from '../dto/login.dto';
import { GoogleAuthService } from '../google-auth.service';
import { Profile } from '../../profile/entities/profile.entity';
import { CustomHttpException } from '../../../helpers/custom-http-filter';
import { OrganisationsService } from '../../../modules/organisations/organisations.service';

jest.mock('speakeasy');

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userServiceMock: jest.Mocked<UserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let otpServiceMock: jest.Mocked<OtpService>;
  let emailServiceMock: jest.Mocked<EmailService>;
  let googleAuthServiceMock: jest.Mocked<GoogleAuthService>;
  let organisationServiceMock: jest.Mocked<OrganisationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,

        {
          provide: UserService,
          useValue: {
            getUserRecord: jest.fn(),
            updateUserRecord: jest.fn(),
            createUser: jest.fn(),
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
          provide: OrganisationsService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendForgotPasswordMail: jest.fn(),
            sendUserEmailConfirmationOtp: jest.fn(),
            sendEmail: jest.fn(),
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
    organisationServiceMock = module.get(OrganisationsService) as jest.Mocked<OrganisationsService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createNewUser', () => {
    const createUserDto = {
      id: '1',
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
      is_active: true,
      attempts_left: 3,
      time_left: 0,
      profile: {
        profile_pic_url: 'some_url',
      } as Profile,
    };

    it('should create a new user successfully', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);
      userServiceMock.createUser.mockResolvedValueOnce(undefined);
      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);
      jwtServiceMock.sign.mockReturnValueOnce('mocked_token');

      const result = await service.createNewUser(createUserDto);

      expect(result).toEqual({
        message: SYS_MSG.USER_CREATED_SUCCESSFULLY,
        access_token: 'mocked_token',
        data: {
          user: {
            avatar_url: 'some_url',
            email: 'test@example.com',
            first_name: 'John',
            id: '1',
            last_name: 'Doe',
          },
        },
      });
    });

    it('should return error if user already exists', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);

      await expect(service.createNewUser(createUserDto)).rejects.toThrow(HttpException);
    });

    it('should return error if user creation fails', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);
      userServiceMock.createUser.mockResolvedValueOnce(undefined);
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);

      await expect(service.createNewUser(createUserDto)).rejects.toThrow(HttpException);
    });
  });

  describe('loginUser', () => {
    it('should return login response if credentials are valid', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
      const user = {
        id: '1',
        email: loginDto.email,
        first_name: 'Test',
        last_name: 'User',
        password: await bcrypt.hash('password123', 10),
        is_active: true,
        attempts_left: 2,
        created_at: new Date(),
        updated_at: new Date(),
        profile: {
          profile_pic_url: 'profile_url',
        } as Profile,
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
            id: '1',
            first_name: 'Test',
            last_name: 'User',
            email: 'test@example.com',
            avatar_url: 'profile_url',
          },
        },
      });
    });

    it('should throw an unauthorized error for invalid email', async () => {
      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'password123' };

      userServiceMock.getUserRecord.mockResolvedValue(null);

      expect(service.loginUser(loginDto)).rejects.toThrow(CustomHttpException);
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
      expect(service.loginUser(loginDto)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('verify2fa', () => {
    it('should throw error if totp code is incorrect', () => {
      const verify2faDto: Verify2FADto = { totp_code: '12345' };
      const userId = 'some-uuid-here';

      const user: UserResponseDTO = {
        id: userId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        attempts_left: 2,
        is_active: true,
        secret: 'some-2fa-secret',
        is_2fa_enabled: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(user);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      expect(service.verify2fa(verify2faDto, userId)).rejects.toThrow(CustomHttpException);
    });

    it('should enable 2fa if successful', async () => {
      const verify2faDto: Verify2FADto = { totp_code: '12345' };
      const userId = 'some-uuid-here';

      const user: UserResponseDTO = {
        id: userId,
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        attempts_left: 2,
        is_active: true,
        secret: 'some-2fa-secret',
        is_2fa_enabled: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const codes: string[] = ['98765432', '87654321', '76543210', '65432109', '54321098'];
      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(user);
      jest.spyOn(userServiceMock, 'updateUserRecord').mockResolvedValueOnce(undefined);
      jest.spyOn(service, 'generateBackupCodes').mockReturnValue(codes);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = await service.verify2fa(verify2faDto, userId);
      expect(result).toEqual({
        message: SYS_MSG.TWO_FACTOR_VERIFIED_SUCCESSFULLY,
        data: { backup_codes: codes },
      });
    });
  });

  describe('changePassword', () => {
    const userId = 'some-uuid-here';
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';

    let mockUser: Partial<User>;

    beforeEach(async () => {
      mockUser = {
        id: userId,
        email: 'test@example.com',
        password: await bcrypt.hash(oldPassword, 10),
        first_name: 'John',
        last_name: 'Doe',
      };
    });

    it('should change password successfully', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);
      userServiceMock.updateUserRecord.mockResolvedValueOnce(undefined);

      const result = await service.changePassword(userId, oldPassword, newPassword);

      expect(userServiceMock.getUserRecord).toHaveBeenCalledWith({
        identifier: userId,
        identifierType: 'id',
      });
      expect(userServiceMock.updateUserRecord).toHaveBeenCalledWith({
        updatePayload: { password: expect.any(String) },
        identifierOptions: {
          identifierType: 'id',
          identifier: userId,
        },
      });
      expect(result).toEqual({
        message: SYS_MSG.PASSWORD_UPDATED,
      });
    });

    it('should throw NOT FOUND if user does not exist', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);

      await expect(service.changePassword(userId, oldPassword, newPassword)).rejects.toThrow(CustomHttpException);
    });

    it('should throw INVALID PASSWORD if old password is incorrect', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(mockUser as User);
      const wrongOldPassword = 'wrongOldPassword';

      await expect(service.changePassword(userId, wrongOldPassword, newPassword)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate random backup codes when called', () => {
      const codes = service.generateBackupCodes();
      expect(codes).toBeInstanceOf(Array);
    });
  });
  describe('forgotPassword', () => {
    const email = 'test@example.com';
    const emailData = {
      to: email,
      subject: 'Reset Password',
      template: 'Password-Reset-Complete-Template',
      context: {
        otp: '123456',
        name: email,
      },
    };

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

      const result = await service.forgotPassword({ email });

      expect(result.message).toBe('Email sent successfully');
    });

    it('should throw error if user not found', async () => {
      userServiceMock.getUserRecord.mockRejectedValueOnce(
        new BadRequestException({
          status_code: HttpStatus.BAD_REQUEST,
          message: SYS_MSG.USER_ACCOUNT_DOES_NOT_EXIST,
        })
      );

      await expect(service.forgotPassword({ email })).rejects.toThrow(HttpException);
    });
  });

  describe('Enabling two factor authentication', () => {
    it('should return NOT FOUND if user does not exists', async () => {
      const user_id = 'another-uuid-value-over-here';
      const password = 'password';

      const existingRecord = null;
      jest.spyOn(userServiceMock, 'getUserRecord').mockResolvedValueOnce(existingRecord);
      await expect(service.enable2FA(user_id, password)).rejects.toThrow(CustomHttpException);
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

      await expect(service.enable2FA(user_id, password)).rejects.toThrow(CustomHttpException);
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

      const secret: speakeasy.GeneratedSecret = {
        base32: 'base 32',
        ascii: 'ascii',
        hex: 'hex',
        google_auth_qr: 'dhjad',
      };
      jest.spyOn(speakeasy, 'generateSecret').mockReturnValue(secret);
      jest.spyOn(userServiceMock, 'updateUserRecord').mockResolvedValueOnce(undefined);

      const expectedResponse = {
        status_code: HttpStatus.OK,
        message: SYS_MSG.TWO_FA_INITIATED,
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
