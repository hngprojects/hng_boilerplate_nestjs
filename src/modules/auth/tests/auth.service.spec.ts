import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ERROR_OCCURED,
  TWO_FACTOR_VERIFIED_SUCCESSFULLY,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
} from '../../../helpers/SystemMessages';
import { CreateUserDTO } from '../dto/create-user.dto';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import AuthenticationService from '../auth.service';
import UserResponseDTO from '../../../modules/user/dto/user-response.dto';
import * as speakeasy from 'speakeasy';
import UserInterface from '../../../modules/user/interfaces/UserInterface';
import { Verify2FADto } from '../dto/verify-2fa.dto';

jest.mock('speakeasy');

describe('Authentication Service tests', () => {
  let userService: UserService;
  let authService: AuthenticationService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthenticationService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);
  });

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
        two_factor_secret: 'some-2fa-secret',
        is_two_factor_enabled: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(user);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      expect(authService.verify2fa(verify2faDto, userId)).rejects.toThrow(BadRequestException);
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
        two_factor_secret: 'some-2fa-secret',
        is_two_factor_enabled: false,
        created_at: new Date(),
        updated_at: new Date(),
      };
      const codes: string[] = ['98765432', '87654321', '76543210', '65432109', '54321098'];
      jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(user);
      jest.spyOn(userService, 'saveUser').mockResolvedValueOnce(undefined);
      jest.spyOn(authService, 'generateBackupCodes').mockReturnValue(codes);
      (speakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      const result = await authService.verify2fa(verify2faDto, userId);
      expect(result).toEqual({
        status_code: HttpStatus.OK,
        message: TWO_FACTOR_VERIFIED_SUCCESSFULLY,
        data: { backup_codes: codes },
      });
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate random backup codes when called', () => {
      const codes = authService.generateBackupCodes();
      expect(codes).toBeInstanceOf(Array);
    });
  });
});
