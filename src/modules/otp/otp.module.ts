import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import OtpService from './otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User])],
  providers: [OtpService, Repository],
  exports: [OtpService, TypeOrmModule.forFeature([Otp])],
})
export class OtpModule {}
