import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { HelpCenterTopic } from './entities/help-center-topic.entity';
import { Organisation } from './entities/org.entity';
import { Waitlist } from '../modules/waitlist/waitlist.entity';
import { Testimonial } from './entities/testimonials.entity';
import { SubscriptionPlan } from './entities/subscription-plans.entity';
import { Squeeze } from './entities/squeeze.entity';
import { Sms } from './entities/sms.entity';
import { Settings } from './entities/settings.entity';
import { Sessions } from './entities/sessions.entity';
import { Roles } from './entities/roles.entity';
import { Review } from './entities/reviews.entity';
import { Regions } from './entities/regions.entity';
import { Product } from './entities/products.entity';
import { ProductCategory } from './entities/product-categories.entity';
import { Permissions } from './entities/permissions.entity';
import { NotificationSettings } from './entities/notification-settings.entity';
import { Newsletter } from './entities/newsletters.entity';
import { JobListing } from './entities/job-listing.entity';
import { Invite } from './entities/invite.entity';
import { Feature } from './entities/feature.entity';
import { Faqs } from './entities/faqs.entity';
import { CustomSections } from './entities/custom-sections.entity';
import { Blog } from './entities/blogs.entity';
import { BlogCategory } from './entities/blogs-categories.entity';
import { AboutUs } from './entities/about-us.entity';
import { AboutUsService } from './entities/about-us-services.entity';
import { AboutPageStats } from './entities/about-page-stats.entity';
import { AboutUsAccessToken } from './entities/about-us-access-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      HelpCenterTopic,
      Organisation,
      Waitlist,
      Testimonial,
      SubscriptionPlan,
      Squeeze,
      Sms,
      Settings,
      Sessions,
      Roles,
      Review,
      Regions,
      Product,
      ProductCategory,
      Permissions,
      NotificationSettings,
      Newsletter,
      JobListing,
      Invite,
      Feature,
      Faqs,
      CustomSections,
      Blog,
      BlogCategory,
      AboutUs,
      AboutUsService,
      AboutPageStats,
      AboutUsAccessToken,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
