import { Module } from '@nestjs/common';
import { Auth2FAService } from './auth2fa.service';
import { Auth2FAController } from './auth2fa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [Auth2FAController],
  providers: [Auth2FAService],
})
export class Auth2FAModule {}
