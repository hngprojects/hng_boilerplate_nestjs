import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { Invite } from './entities/invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../organisations/entities/organisations.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invite, Organisation])],
  controllers: [InviteController],
  providers: [InviteService],
})
export class InviteModule {}
