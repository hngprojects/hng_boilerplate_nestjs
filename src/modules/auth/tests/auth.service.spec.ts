import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import AuthenticationService from '../auth.service';
import UserService from '../../user/user.service';
import { OtpService } from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import {
  ERROR_OCCURED,
  FAILED_TO_CREATE_USER,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../../helpers/SystemMessages';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userServiceMock: jest.Mocked<UserService>;
  let jwtServiceMock: jest.Mocked<JwtService>;
  let otpServiceMock: jest.Mocked<OtpService>;
  let emailServiceMock: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
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
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userServiceMock = module.get(UserService) as jest.Mocked<UserService>;
    jwtServiceMock = module.get(JwtService) as jest.Mocked<JwtService>;
    otpServiceMock = module.get(OtpService) as jest.Mocked<OtpService>;
    emailServiceMock = module.get(EmailService) as jest.Mocked<EmailService>;
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

    it('should create a new user successfully', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);
      userServiceMock.createUser.mockResolvedValueOnce(undefined);
      userServiceMock.getUserRecord.mockResolvedValueOnce({
        id: '1',
        email: createUserDto.email,
        first_name: createUserDto.first_name,
        last_name: createUserDto.last_name,
        created_at: new Date(),
      });
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
      userServiceMock.getUserRecord.mockResolvedValueOnce({ id: '1' });

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

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should send reset password email successfully', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce({ id: '1' });
      otpServiceMock.createOtp.mockResolvedValueOnce({
        token: '123456',
        expiry: new Date(),
        user_id: '1',
        id: '1',
        user: {
          id: '1',
          email,
          first_name: 'John',
          last_name: 'Doe',
          hashPassword: jest.fn(),
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
          password: 'password',
          attempts_left: 0,
          time_left: 0,
        },
        created_at: new Date(),
        updated_at: new Date(),
      });
      emailServiceMock.sendMail.mockResolvedValueOnce(undefined);

      await service.forgotPassword(email);

      expect(emailServiceMock.sendMail).toHaveBeenCalledWith(
        email,
        'Password Reset Request',
        'Your OTP code is: 123456',
        '<p>Your OTP code is: <strong>123456</strong></p>'
      );
    });

    it('should return error if user not found', async () => {
      userServiceMock.getUserRecord.mockResolvedValueOnce(null);

      const result = await service.forgotPassword(email);

      expect(result).toEqual({
        status_code: HttpStatus.BAD_REQUEST,
        message: FAILED_TO_CREATE_USER,
      });
    });

    it('should throw HttpException on unexpected error', async () => {
      userServiceMock.getUserRecord.mockRejectedValueOnce(new Error('Unexpected error'));

      await expect(service.forgotPassword(email)).rejects.toThrow(HttpException);
    });
  });
});
