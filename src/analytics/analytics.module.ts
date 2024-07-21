import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Revenue } from '../entities/revenue.entity';
import { TokenPresenceMiddleware } from '../middlewares/token-presence.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, Revenue])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
})
export class AnalyticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenPresenceMiddleware).forRoutes('api/v1/analytics/*');
  }
}
