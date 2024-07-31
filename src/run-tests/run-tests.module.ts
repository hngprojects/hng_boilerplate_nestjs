import { Module } from '@nestjs/common';
import { RunTestsService } from './run-tests.service';
import { RunTestsController } from './run-tests.controller';

@Module({
  controllers: [RunTestsController],
  providers: [RunTestsService],
})
export class RunTestsModule {}
