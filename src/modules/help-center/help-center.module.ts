import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpCenterController } from './help-center.controller';
import { HelpCenterService } from './help-center.service';
import { HelpCenter } from './help-center.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([HelpCenter]), ],
  controllers: [HelpCenterController],
  providers: [HelpCenterService],
})
export class HelpCenterModule {}

