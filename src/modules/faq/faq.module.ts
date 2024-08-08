import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { Faq } from './entities/faq.entity';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Faq, User, Organisation, OrganisationUserRole, Role])],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
