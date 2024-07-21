import { Module } from '@nestjs/common';
import { HelpCenterTopicController } from './help-center-topic.controller';
import { HelpCenterTopicService } from './help-center-topic.service';

@Module({
  controllers: [HelpCenterTopicController],
  providers: [HelpCenterTopicService],
})
export class HelpCenterModule {}
