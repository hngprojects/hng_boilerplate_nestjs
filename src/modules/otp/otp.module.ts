import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Otp } from './entities/otp.entity';
import { OtpService } from './otp.service';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Otp])],
  providers: [OtpService, Repository],
  exports: [OtpService],
})
export class OtpModule {}
