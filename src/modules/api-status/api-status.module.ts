import { Module } from '@nestjs/common';
import { ApiStatusService } from './api-status.service';
import { ApiStatusController } from './api-status.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiHealth } from './entities/api-status.entity';

@Module({
  controllers: [ApiStatusController],
  imports: [TypeOrmModule.forFeature([ApiHealth, Request])],
  providers: [ApiStatusService],
})
export class ApiStatusModule {}
