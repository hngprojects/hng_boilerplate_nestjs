import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { OtpService } from './otp.service';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Otp, User])],
  providers: [OtpService, Repository],
  exports: [OtpService, TypeOrmModule.forFeature([Otp])],
})
export class OtpModule {}
