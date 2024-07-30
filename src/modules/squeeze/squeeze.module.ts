import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';
import { SqueezeController } from './squeeze.controller';
import { SqueezeService } from './squeeze.service';

@Module({
  imports: [TypeOrmModule.forFeature([Squeeze])],
  controllers: [SqueezeController],
  providers: [SqueezeService],
})
export class SqueezeModule {}
