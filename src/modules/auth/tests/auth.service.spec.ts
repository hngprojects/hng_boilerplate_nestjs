import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as bcrypt from 'bcryptjs';
import OtpService from '../../otp/otp.service';
import { EmailService } from '../../email/email.service';
import { CreateUserDTO } from '../dto/create-user.dto';
import UserService from '../../user/user.service';
import AuthenticationService from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Otp } from '../../otp/entities/otp.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { CustomHttpException } from '../../../helpers/custom-http-filter';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userService: UserService;
  let jwtService: JwtService;
  let otpService: OtpService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        UserService,
        JwtService,
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

    service = module.get<AuthenticationService>(AuthenticationService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    otpService = module.get<OtpService>(OtpService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for createNewUser method
  describe('createNewUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      const mockUser = {
        id: '123',
        email: createUserDto.email,
        first_name: 'John',
        last_name: 'Doe',
        created_at: new Date(),
      };
      // jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser);

      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      const result = await service.createNewUser(createUserDto);

      expect(result.status_code).toEqual(HttpStatus.CREATED);
      expect(result.message).toEqual('User created successfully');
      expect(result.data.token).toEqual('mockAccessToken');
      expect(result.data.user.email).toEqual(createUserDto.email);
    });

    it('should return error if user already exists', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Existing',
        last_name: 'User',
      };

      const mockUser = {
        id: '123',
        email: createUserDto.email,
        first_name: 'Existing',
        last_name: 'User',
        created_at: new Date(),
      };
      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(mockUser);

      const result = await service.createNewUser(createUserDto);

      expect(result.status_code).toEqual(HttpStatus.BAD_REQUEST);
      expect(result.message).toEqual('Account with the specified email exists');
    });

    it('should handle errors during user creation', async () => {
      const createUserDto: CreateUserDTO = {
        email: 'error@example.com',
        password: 'password123',
        first_name: 'Existing',
        last_name: 'User',
      };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      jest.spyOn(userService, 'createUser').mockRejectedValue(new Error('Database error'));

      await expect(service.createNewUser(createUserDto)).rejects.toThrowError('Error Occured Performing this request');
    });
  });

  describe('loginUser', () => {
    it('should login a user with valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: '123',
        email: loginDto.email,
        first_name: 'John',
        last_name: 'Doe',
        password: await bcrypt.hash('password123', 10),
      };
      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(mockUser);

      jest.spyOn(jwtService, 'sign').mockReturnValue('mockAccessToken');

      const result = await service.loginUser(loginDto);

      expect(result.message).toEqual('Login successful');
      expect(result.access_token).toEqual('mockAccessToken');
      expect(result.data.user.email).toEqual(loginDto.email);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'invalidPassword',
      };

      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(null);

      await expect(service.loginUser(loginDto)).rejects.toThrow(CustomHttpException);
    });

    it('should throw UnauthorizedException with incorrect password', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'incorrectPassword',
      };

      const mockUser = {
        id: '123',
        email: loginDto.email,
        first_name: 'John',
        last_name: 'Doe',
        password: await bcrypt.hash('password123', 10),
      };
      jest.spyOn(userService, 'getUserRecord').mockResolvedValue(mockUser);

      await expect(service.loginUser(loginDto)).rejects.toThrow('Invalid password or email');
    });

    it('should handle errors during login', async () => {
      const loginDto: LoginDto = {
        email: 'error@example.com',
        password: 'password123',
      };

      jest.spyOn(userService, 'getUserRecord').mockRejectedValue(new Error('Database error'));

      await expect(service.loginUser(loginDto)).rejects.toThrow('An error occurred during login');
    });
  });

  describe('enable2FA', () => {
    it('should enable two-factor authentication for a user', async () => {
      const user_id = '123';
      const password = 'password123';

      const mockUser = {
        id: user_id,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        is_2fa_enabled: false,
      };
      jest.spyOn(service as any, 'validateUserAndPassword').mockResolvedValue({
        user: mockUser,
        isValid: true,
      });

      jest.spyOn(speakeasy, 'generateSecret').mockReturnValue({
        base32: 'base32secret',
        ascii: 'asciisecret',
      });

      jest.spyOn(userService as any, 'updateUserRecord').mockResolvedValue(true);

      jest.spyOn(speakeasy, 'otpauthURL').mockReturnValue('http://example.com/qrcode');

      const result = await service.enable2FA(user_id, password);

      expect(result.status_code).toEqual(HttpStatus.OK);
      expect(result.message).toEqual('2FA setup initiated');
      expect(result.data.secret).toEqual('base32secret');
      expect(result.data.qr_code_url).toEqual('http://example.com/qrcode');
    });

    it('should throw HttpException if validation fails', async () => {
      const user_id = '';
      const password = 'incorrectPassword';

      const validationError = {
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Invalid password',
      };
      jest.spyOn(service as any, 'validateUserAndPassword').mockResolvedValue({
        isValid: false,
        ...validationError,
      });

      await expect(service.enable2FA(user_id, password)).rejects.toThrow(HttpException);
    });

    it('should handle errors during enable2FA', async () => {
      const user_id = '123';
      const password = 'password123';

      const mockUser = {
        id: user_id,
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        is_2fa_enabled: false,
      };
      jest.spyOn(service as any, 'validateUserAndPassword').mockResolvedValue({
        user: mockUser,
        isValid: true,
      });

      jest.spyOn(speakeasy, 'generateSecret').mockImplementation(() => {
        throw new Error('Failed to generate secret');
      });

      await expect(service.enable2FA(user_id, password)).rejects.toThrow('Failed to generate secret');
    });
  });
});
