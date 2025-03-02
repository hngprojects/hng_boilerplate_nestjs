import { Module } from '@nestjs/common';
import { BillingPlanService } from './billing-plan.service';
import { BillingPlanController } from './billing-plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingPlan } from './entities/billing-plan.entity';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionScheduler } from './subscription-scheduler';

@Module({
  imports: [
    TypeOrmModule.forFeature([BillingPlan, User, Organisation, OrganisationUserRole, Role]),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.example.com',
        port: 587,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: __dirname + '/../../email/hng-templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [BillingPlanController],
  providers: [BillingPlanService, SubscriptionScheduler],
})
export class BillingPlanModule {}
