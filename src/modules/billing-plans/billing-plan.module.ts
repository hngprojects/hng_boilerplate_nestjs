import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Role } from '@modules/role/entities/role.entity';
import { BillingPlanController } from './billing-plan.controller';
import { BillingPlanService } from './billing-plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([BillingPlan, User, Organisation, OrganisationUserRole, Role])],
  controllers: [BillingPlanController],
  providers: [BillingPlanService],
})
export class BillingPlanModule {}
