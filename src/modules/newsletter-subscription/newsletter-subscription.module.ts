import { Module } from '@nestjs/common';
import { NewsletterSubscriptionService } from './newsletter-subscription.service';
import { NewsletterSubscriptionController } from './newsletter-subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { User } from '@modules/user/entities/user.entity';
import { Organisation } from '@modules/organisations/entities/organisations.entity';
import { OrganisationUserRole } from '@modules/role/entities/organisation-user-role.entity';
import { Role } from '@modules/role/entities/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscription, User, Organisation, OrganisationUserRole, Role])],
  controllers: [NewsletterSubscriptionController],
  providers: [NewsletterSubscriptionService],
})
export class NewsletterSubscriptionModule {}
