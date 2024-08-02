import { Module } from '@nestjs/common';
import { SqueezePagesService } from './squeeze-pages.service';
import { SqueezePagesController } from './squeeze-pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SqueezePage } from './entities/squeeze-pages.entity';

@Module({
  controllers: [SqueezePagesController],
  providers: [SqueezePagesService],
  imports: [TypeOrmModule.forFeature([SqueezePage])],
})
export class SqueezePagesModule {}
