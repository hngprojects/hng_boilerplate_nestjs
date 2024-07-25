import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportUserController } from './export-user.controller';
import { ExportUserService } from './export-user.service';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [ExportUserController],
  providers: [ExportUserService],
})
export class ExportUserModule {}
