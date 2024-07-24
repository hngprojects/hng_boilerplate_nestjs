import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { OtpDto } from './dto/otp.dto';

@Injectable()
export default class OtpService {
  constructor(
    @InjectRepository(Otp)
    private otpRepository: Repository<Otp>
  ) {}

  async createOtp(data: OtpDto) {
    const newOtp = this.otpRepository.create(data);
    return await this.otpRepository.save(newOtp, { reload: true });
  }

  async findOtp(email: string) {
    const otp = await this.otpRepository.findOne({ where: { email } });
    return otp;
  }

  async deleteOtp(email: string) {
    return await this.otpRepository.delete({ email });
  }
}
