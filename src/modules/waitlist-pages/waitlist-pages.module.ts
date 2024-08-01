import { Module } from '@nestjs/common';
import { WaitlistPageController } from './waitlist-pages.controller';
import WaitlistPageService from './waitlist-pages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistPage } from './entities/waitlist-page.entity';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  controllers: [WaitlistPageController],
  providers: [WaitlistPageService],
  imports: [TypeOrmModule.forFeature([WaitlistPage]), UserModule],
})
export class WaitlistPageModule {}
