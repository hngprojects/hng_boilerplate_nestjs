import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpCenterService } from './help-center.service';
import { HelpCenterController } from './help-center.controller';
import { HelpCenter } from './entities/help-center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HelpCenter])],
  providers: [HelpCenterService],
  controllers: [HelpCenterController],
})
export class HelpCenterModule {}
