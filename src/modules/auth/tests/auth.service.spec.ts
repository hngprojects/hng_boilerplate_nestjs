import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ERROR_OCCURED,
  INVALID_PASSWORD,
  TWO_FA_ENABLED,
  TWO_FA_INITIATED,
  USER_ACCOUNT_EXIST,
  USER_CREATED_SUCCESSFULLY,
  USER_NOT_FOUND,
} from '../../../helpers/SystemMessages';
import { CreateUserDTO } from '../dto/create-user.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import AuthenticationService from '../auth.service';
import UserResponseDTO from 'src/modules/user/dto/user-response.dto';

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
});

describe('Enabling two factor authentication', () => {
  let userService: UserService;
  let authService: AuthenticationService;

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
  });

  it('should return NOT FOUND if user does not exists', async () => {
    const user_id = 'another-uuid-value-over-here';
    const password = 'password';

    const existingRecord = null;
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);
    const user = await authService.enable2FA(user_id, password);
    expect(user).toEqual({
      status_code: HttpStatus.NOT_FOUND,
      message: USER_NOT_FOUND,
    });
  });

  it('should return INVALID PASSWORD if user enters a wrong password', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'abc';

    const existingRecord = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: '$2b$10$D3b5VePudD8yzFNJGFKbDe4CKGCXbd5r3ektMFKMj5.383kdhH51.',
      id: 'some-uuid-value-here',
    };
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);
    const res = await authService.enable2FA(user_id, password);
    expect(res).toEqual({
      status_code: HttpStatus.BAD_REQUEST,
      message: INVALID_PASSWORD,
    });
  });

  it('should return 2FA ALREADY ENABLED if user tries to enable 2fa when enabled', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'password';

    const existingRecord = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: '$2b$10$D3b5VePudD8yzFNJGFKbDe4CKGCXbd5r3ektMFKMj5.383kdhH51.',
      secret: 'secret',
      is_2fa_enabled: true,
      id: 'some-uuid-value-here',
    };
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);
    const res = await authService.enable2FA(user_id, password);
    expect(res).toEqual({
      status_code: HttpStatus.BAD_REQUEST,
      message: TWO_FA_ENABLED,
    });
  });

  it('should enable 2FA and return secret and QR code URL for a valid user', async () => {
    const user_id = 'some-uuid-value-here';
    const password = 'password';

    const existingRecord = {
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      password: '$2b$10$D3b5VePudD8yzFNJGFKbDe4CKGCXbd5r3ektMFKMj5.383kdhH51.',
      is_2fa_enabled: false,
      id: 'some-uuid-value-here',
    };
    jest.spyOn(userService, 'getUserRecord').mockResolvedValueOnce(existingRecord);

    const secret = speakeasy.generateSecret({ length: 32 });
    jest.spyOn(speakeasy, 'generateSecret').mockReturnValue(secret);
    jest.spyOn(userService, 'createUserSecret').mockResolvedValueOnce(undefined);

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
