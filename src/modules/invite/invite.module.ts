import { Module } from '@nestjs/common';
import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';
import { Invite } from './entities/invite.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationsService } from '../organisations/organisations.service';
import { User } from '../user/entities/user.entity';
import { EmailService } from '../email/email.service';
import QueueService from '../email/queue.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, Organisation, User]),
    BullModule.registerQueue({
      name: 'emailSending',
    }),
  ],
  controllers: [InviteController],
  providers: [InviteService, EmailService, QueueService],
})
export class InviteModule {}
