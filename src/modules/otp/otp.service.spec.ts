import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity';
import { User } from '../user/entities/user.entity';

// Mock the generateSixDigitToken function
jest.mock('../../utils/generate-token', () => ({
  generateSixDigitToken: jest.fn().mockReturnValue('123456'),
}));

describe('OtpService', () => {
  let service: OtpService;
  let otpRepositoryMock: jest.Mocked<Repository<Otp>>;
  let userRepositoryMock: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(Otp),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpRepositoryMock = module.get(getRepositoryToken(Otp)) as jest.Mocked<Repository<Otp>>;
    userRepositoryMock = module.get(getRepositoryToken(User)) as jest.Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOtp', () => {
    it('should create an OTP successfully', async () => {
      const userId = '123';
      const user = { id: userId } as User;
      const otp = {
        id: '1',
        token: '123456',
        expiry: expect.any(Date),
        user,
        user_id: userId,
      } as Otp;

      userRepositoryMock.findOne.mockResolvedValue(user);
      otpRepositoryMock.create.mockReturnValue(otp);
      otpRepositoryMock.save.mockResolvedValue(otp);

      const result = await service.createOtp(userId);

      expect(result).toEqual(otp);
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(otpRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: '123456',
          expiry: expect.any(Date),
          user,
          user_id: userId,
        })
      );
      expect(otpRepositoryMock.save).toHaveBeenCalledWith(otp);
    });

    it('should return null if user is not found', async () => {
      const userId = '123';

      userRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.createOtp(userId);

      expect(result).toBeNull();
      expect(userRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(otpRepositoryMock.create).not.toHaveBeenCalled();
      expect(otpRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('verifyOtp', () => {
    it('should return true for a valid OTP', async () => {
      const userId = '123';
      const token = '123456';
      const otp = {
        id: '1',
        token,
        expiry: new Date(Date.now() + 1000 * 60), // 1 minute in the future
        user_id: userId,
      } as Otp;

      otpRepositoryMock.findOne.mockResolvedValue(otp);

      const result = await service.verifyOtp(userId, token);

      expect(result).toBe(true);
      expect(otpRepositoryMock.findOne).toHaveBeenCalledWith({ where: { token, user_id: userId } });
    });

    it('should return false for an invalid OTP', async () => {
      const userId = '123';
      const token = '123456';

      otpRepositoryMock.findOne.mockResolvedValue(null);

      const result = await service.verifyOtp(userId, token);

      expect(result).toBe(false);
      expect(otpRepositoryMock.findOne).toHaveBeenCalledWith({ where: { token, user_id: userId } });
    });

    it('should return false for an expired OTP', async () => {
      const userId = '123';
      const token = '123456';
      const otp = {
        id: '1',
        token,
        expiry: new Date(Date.now() - 1000 * 60), // 1 minute in the past
        user_id: userId,
      } as Otp;

      otpRepositoryMock.findOne.mockResolvedValue(otp);

      const result = await service.verifyOtp(userId, token);

      expect(result).toBe(false);
      expect(otpRepositoryMock.findOne).toHaveBeenCalledWith({ where: { token, user_id: userId } });
    });
  });
});
