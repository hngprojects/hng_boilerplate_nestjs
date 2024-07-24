import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './waitlist.entity';
import { EmailService } from '../email/email.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Waitlist]), EmailModule],
  controllers: [WaitlistController],
  providers: [WaitlistService, EmailService],
})
export class WaitlistModule {}
