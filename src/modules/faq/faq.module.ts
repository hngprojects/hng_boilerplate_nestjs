import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { Faq } from './entities/faq.entity';
import { User } from '@modules/user/entities/user.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { Role } from '@modules/role/entities/role.entity';
import { TextService } from '@modules/translation/translation.service';

@Module({
  imports: [TypeOrmModule.forFeature([Faq, User, Organisation, OrganisationUserRole, Role])],
  controllers: [FaqController],
  providers: [FaqService, TextService],
})
export class FaqModule {}
