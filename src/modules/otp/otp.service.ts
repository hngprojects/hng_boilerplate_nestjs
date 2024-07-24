import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { User } from '../user/entities/user.entity';
import { generateSixDigitToken } from '../../utils/generate-token';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async createOtp(userId: string): Promise<Otp | null> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error('User not found');
      }

      const token = generateSixDigitToken();
      const expiry = new Date(Date.now() + 5 * 60 * 1000);

      const otp = this.otpRepository.create({ token, expiry, user, user_id: userId });
      await this.otpRepository.save(otp);

      return otp;
    } catch (error) {
      console.error('Error creating OTP:', error);
      return null;
    }
  }

  async verifyOtp(userId: string, token: string): Promise<boolean> {
    try {
      const otp = await this.otpRepository.findOne({ where: { token, user_id: userId } });

      if (!otp) {
        throw new Error('Invalid OTP');
      }

      if (otp.expiry < new Date()) {
        throw new Error('OTP expired');
      }

      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  }
}
