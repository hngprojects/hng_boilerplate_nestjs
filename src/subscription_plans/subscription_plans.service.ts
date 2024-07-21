import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionPlanDto } from './dto/create-subscription_plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../database/entities/subscription_plan.entity';
import { Repository } from 'typeorm';
import { Feature } from 'src/database/entities/feature.entity';

@Injectable()
export class SubscriptionPlansService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private subscriptionPlanRepository: Repository<SubscriptionPlan>,
    @InjectRepository(Feature)
    private featureRepository: Repository<Feature>
  ) {}

  async create(createSubscriptionPlanDto: CreateSubscriptionPlanDto) {
    try {
      const existingPlan = await this.subscriptionPlanRepository.findOne({
        where: { name: createSubscriptionPlanDto.name },
      });
      if (existingPlan) {
        throw new ConflictException('subscription plan already exists.');
      }

      const features = await Promise.all(
        createSubscriptionPlanDto.feature.map(async featureName => {
          let feature = await this.featureRepository.findOne({
            where: { feature: featureName },
          });
          if (!feature) {
            feature = this.featureRepository.create({ feature: featureName });
            await this.featureRepository.save(feature);
          }
          return feature;
        })
      );

      const newSubscriptionPlan = this.subscriptionPlanRepository.create({
        ...createSubscriptionPlanDto,
        feature: features,
      });

      await this.subscriptionPlanRepository.save(newSubscriptionPlan);
      return {
        data: {
          id: newSubscriptionPlan.id,
          name: newSubscriptionPlan.name,
          description: newSubscriptionPlan.description,
          price: newSubscriptionPlan.price,
          duration: newSubscriptionPlan.duration,
          features: newSubscriptionPlan.feature.map(f => f.feature),
        },
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            error: error.message,
          },
          HttpStatus.BAD_REQUEST
        );
      } else if (error instanceof ForbiddenException) {
        throw new HttpException(
          {
            status: HttpStatus.FORBIDDEN,
            error: 'User is not authorized to create subscription plans.',
          },
          HttpStatus.FORBIDDEN
        );
      } else {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'An unexpected error occurred.',
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
