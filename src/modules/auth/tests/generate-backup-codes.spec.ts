import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import UserService from '../../user/user.service';
import { User } from '../../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
// import { ERROR_OCCURED, USER_ACCOUNT_EXIST, USER_CREATED_SUCCESSFULLY } from '../../../helpers/SystemMessages';
// import { CreateUserDTO } from '../dto/create-user.dto';
import AuthenticationService from '../auth.service';
import * as bcrypt from 'bcrypt';

describe('Generate 2-Factor Authentication Backup Codes Test', () => {
  let userService: UserService;
  let authService: AuthenticationService;
  let jwtService: JwtService;
  let userRepository: any;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        AuthenticationService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthenticationService>(AuthenticationService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should return unauthorized if password is incorrect', async () => {
    const userId = 'user-id';
    const password = 'wrong-password';
    const totp_code = 123456;

    userRepository.findOne.mockResolvedValue({
      id: userId,
      password: bcrypt.hashSync('correct-password', 10),
      is_2fa_enabled: true,
      totp_code: 123456,
    });

    const result = await authService.generateBackupCodes({ password, totp_code }, userId);

    expect(result.status_code).toBe(401);
    expect(result.message).toBe('Authentication required');
  });

  it('should return invalid request if 2fa is disabled', async () => {
    const userId = 'user-id';
    const password = 'correct-password';
    const totp_code = 123456;

    userRepository.findOne.mockResolvedValue({
      id: userId,
      password: bcrypt.hashSync(password, 10),
      is_2fa_enabled: false,
      totp_code: 123456,
    });

    const result = await authService.generateBackupCodes({ password, totp_code }, userId);

    expect(result.status_code).toBe(400);
    expect(result.message).toBe('2-Factor Authentication has not been enabled');
  });

  it('should return error if totp_code is incorrect', async () => {
    const userId = 'user-id';
    const password = 'correct-password';
    const totp_code = 123456;

    userRepository.findOne.mockResolvedValue({
      id: userId,
      password: bcrypt.hashSync(password, 10),
      is_2fa_enabled: true,
      totp_code: 654321,
    });

    const result = await authService.generateBackupCodes({ password, totp_code }, userId);

    expect(result.status_code).toBe(400);
    expect(result.message).toBe('TOTP code provided is invalid');
  });

  it('should confirm that 5 backup codes are issued', async () => {
    const userId = 'user-id-to-jail';
    const password = 'correct-password';
    const totp_code = 123456;

    userRepository.findOne.mockResolvedValue({
      id: userId,
      password: bcrypt.hashSync(password, 10),
      is_2fa_enabled: true,
      totp_code: 123456,
      backup_codes_2fa: JSON.stringify([111111, 222222, 333333, 444444, 555555]),
    });
    userRepository.save.mockResolvedValue({
      id: userId,
      backup_codes_2fa: JSON.stringify([111111, 222222, 333333, 444444, 555555]),
    });

    const result = await authService.generateBackupCodes({ password, totp_code }, userId);

    expect(result.status_code).toBe(200);
    expect(result.message).toBe('New backup codes generated');
    expect(result.data.backup_codes.length).toBe(5);
  });
});
