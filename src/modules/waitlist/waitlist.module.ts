import { Module } from '@nestjs/common';
import { WaitlistController } from './waitlist.controller';
import { WaitlistService } from './waitlist.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Waitlist } from '../../database/entities/waitlist.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Waitlist])],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
