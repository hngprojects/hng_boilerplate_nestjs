import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/controllers/auth.controller';
import { RefreshToken } from 'src/entities/refreshToken.entity';
import { User } from 'src/entities/user.entity';
import { AuthService } from 'src/services/auth.service';

@Module({
  imports: [JwtModule.register({}), TypeOrmModule.forFeature([User, RefreshToken])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
