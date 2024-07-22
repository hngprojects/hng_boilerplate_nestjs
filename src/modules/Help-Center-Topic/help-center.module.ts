import { Module } from '@nestjs/common';
import { HelpCenterService } from './help-center.service';
import { HelpCenterController } from './help-center.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpCenterTopic } from 'src/database/entities/help-center-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HelpCenterTopic])],
  controllers: [HelpCenterController],
  providers: [HelpCenterService],
  exports: [],
})
export class HelpCenterModule {}
