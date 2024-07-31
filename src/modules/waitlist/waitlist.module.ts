import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import WaitlistService from './waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from './entities/waitlist.entity';

@Module({
  controllers: [WaitlistController],
  providers: [WaitlistService],
  imports: [TypeOrmModule.forFeature([Waitlist])],
})
export class WaitlistModule {}
