import { Module } from '@nestjs/common';
import OtpService from './otp.service';
import { Repository } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';

@Module({
  providers: [OtpService, Repository],
  imports: [TypeOrmModule.forFeature([Otp])],
  exports: [OtpService],
})
export class OtpModule {}
