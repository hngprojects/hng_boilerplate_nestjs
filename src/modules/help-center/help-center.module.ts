import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpCenterService } from './help-center.service';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterEntity } from './entities/help-center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HelpCenterEntity])],
  providers: [HelpCenterService],
  controllers: [HelpCenterController],
  exports: [HelpCenterService],
})
export class HelpCenterModule {}
