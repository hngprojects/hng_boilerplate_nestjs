import { Module } from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { NewsletterSubscriptionController } from './newsletter-subscripion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { User } from '../user/entities/user.entity';
import { Organisation } from '../organisations/entities/organisations.entity';
import { OrganisationUserRole } from '../role/entities/organisation-user-role.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscription, User, Organisation, OrganisationUserRole, Role])],
  controllers: [NewsletterSubscriptionController],
  providers: [NewsletterSubscriptionService],
})
export class NewsletterSubscriptionModule {}
