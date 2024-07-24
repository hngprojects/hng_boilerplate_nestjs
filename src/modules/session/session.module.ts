import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
// import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session])],
  providers: [SessionService],
  exports: [SessionService],
  controllers: [],
})
export class SessionModule {}
