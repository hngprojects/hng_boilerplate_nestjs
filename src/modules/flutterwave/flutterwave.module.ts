import { Module } from '@nestjs/common';
import { FlutterwaveService } from './flutterwave.service';
import { FlutterwaveController } from './flutterwave.controller';

@Module({
  controllers: [FlutterwaveController],
  providers: [FlutterwaveService],
})
export class FlutterwaveModule {}
