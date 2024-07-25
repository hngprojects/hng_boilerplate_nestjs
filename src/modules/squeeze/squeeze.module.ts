import { Module } from '@nestjs/common';
import { SqueezeService } from './squeeze.service';
import { SqueezeController } from './squeeze.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Squeeze } from './entities/squeeze.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Squeeze])],
  controllers: [SqueezeController],
  providers: [SqueezeService],
})
export class SqueezeModule {}
