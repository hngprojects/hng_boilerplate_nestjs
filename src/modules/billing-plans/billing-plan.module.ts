import { Module } from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { BillingPlanController } from './billing-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingPlan, User, Organisation, OrganisationUserRole, Role])],
  controllers: [BillingPlanController],
  providers: [BillingPlanService],
})
export class BillingPlanModule {}
