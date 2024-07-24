import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpService } from './otp.service';
import { Otp } from './entities/otp.entity';
import { User } from '../user/entities/user.entity';
import { generateSixDigitToken } from '../../utils/generate-token';

jest.mock('../../utils/generate-token', () => ({
  generateSixDigitToken: jest.fn(),
}));

describe('OtpService', () => {
  let service: OtpService;
  let otpRepository: Repository<Otp>;
  let userRepository: Repository<User>;

  const mockOtpRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        {
          provide: getRepositoryToken(Otp),
          useValue: mockOtpRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
    otpRepository = module.get<Repository<Otp>>(getRepositoryToken(Otp));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOtp', () => {
    it('should create an OTP for a valid user', async () => {
      const userId = 'some-user-id';
      const mockUser = { id: userId };
      const token = '123456';
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      const mockOtp = { token, expiry, user: mockUser, user_id: userId };

      mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
      (generateSixDigitToken as jest.Mock).mockReturnValue(token);
      mockOtpRepository.create.mockReturnValue(mockOtp);
      mockOtpRepository.save.mockResolvedValueOnce(mockOtp);

      const result = await service.createOtp(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(generateSixDigitToken).toHaveBeenCalled();
      expect(otpRepository.create).toHaveBeenCalled();
      expect(otpRepository.save).toHaveBeenCalled();
    });

    it('should return null if user is not found', async () => {
      const userId = 'non-existent-user-id';
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.createOtp(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toBeNull();
    });
  });

  describe('verifyOtp', () => {
    it('should verify a valid OTP', async () => {
      const userId = 'some-user-id';
      const token = '123456';
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      const mockOtp = { token, expiry, user_id: userId };

      mockOtpRepository.findOne.mockResolvedValueOnce(mockOtp);

      const result = await service.verifyOtp(userId, token);

      expect(otpRepository.findOne).toHaveBeenCalledWith({ where: { token, user_id: userId } });
      expect(result).toBe(true);
    });

    it('should return false for an invalid OTP', async () => {
      const userId = 'some-user-id';
      const token = 'invalid-token';

      mockOtpRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.verifyOtp(userId, token);

      expect(otpRepository.findOne).toHaveBeenCalledWith({ where: { token, user_id: userId } });
      expect(result).toBe(false);
    });

    it('should return false for an expired OTP', async () => {
      const userId = 'some-user-id';
      const token = '123456';
      const expiry = new Date(Date.now() - 5 * 60 * 1000); // expired OTP
      const mockOtp = { token, expiry, user_id: userId };

      mockOtpRepository.findOne.mockResolvedValueOnce(mockOtp);

      const result = await service.verifyOtp(userId, token);

      expect(otpRepository.findOne).toHaveBeenCalledWith({ where: { token, user_id: userId } });
      expect(result).toBe(false);
    });
  });
});
