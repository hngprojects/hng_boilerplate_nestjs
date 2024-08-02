import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import axios from 'axios';
import { BillingPlan } from '../billing-plans/entities/billing-plan.entity';
import { Organisation } from '../organisations/entities/organisations.entity';

@Injectable()
export class PaymentsService {
  private readonly paystackSecretKey = `${process.env.PAYSTACK_SECRET_KEY}`;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(BillingPlan)
    private readonly billingPlanRepository: Repository<BillingPlan>,
    @InjectRepository(Organisation)
    private readonly organisationRepository: Repository<Organisation>
  ) {}

  async createSubscription(createSubscriptionDto: CreateSubscriptionDto, userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user)
        throw new NotFoundException({
          status_code: 404,
          status: 'Not found Exception',
          message: 'User not found',
        });

      const billingPlan = await this.billingPlanRepository.findOneBy({ id: createSubscriptionDto.plan_id });

      if (!billingPlan) {
        throw new NotFoundException({
          status_code: 404,
          message: 'Billing plan not found',
        });
      }

      const organisation = await this.organisationRepository.findOneBy({ id: createSubscriptionDto.organization_id });

      if (!organisation) {
        throw new NotFoundException({
          status_code: 404,
          message: 'Organisation not found',
        });
      }

      const amount = createSubscriptionDto.billing_option === 'monthly' ? billingPlan.price : billingPlan.price * 12;
      const currentDate = new Date();
      let expiresAt: Date;

      if (createSubscriptionDto.billing_option === 'monthly') {
        expiresAt = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
      } else {
        expiresAt = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
      }

      // Create Plan With Paystack
      const planCreationResponse = await this.createPaystackPlan({
        name: billingPlan.name,
        interval: createSubscriptionDto.billing_option,
        amount: amount * 100,
      });

      const subscriptionData = {
        billing_option: createSubscriptionDto.billing_option,
        plan_id: billingPlan.id,
        price: amount,
        status: 'inactive',
        expiresAt,
        organisation_id: createSubscriptionDto.organization_id,
      };

      const subscription = this.subscriptionRepository.create(
        Object.assign(new Subscription(), { ...subscriptionData })
      );
      await this.subscriptionRepository.save(subscription);

      // initiate Payment with paystack
      const subscriptionResponse = await this.subscribeWithPaystack({
        email: user.email,
        amount: amount * 100,
        plan: planCreationResponse?.data?.data?.plan_code,
        callback_url: `${process.env.SERVER_BASE_URL}/api/v1/payments/paystack/verify?subscriptionId=${subscription.id}`,
      });

      return {
        status: 'success',
        status_code: 200,
        message: 'Payment initiated successfully',
        data: {
          payment_url: subscriptionResponse.data?.data?.authorization_url,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new HttpException(
        {
          message: `Internal server error: ${error.message}`,
          status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private async createPaystackPlan(planDetails: any) {
    const url = `${this.paystackBaseUrl}/plan`;

    try {
      const response = await axios.post(url, planDetails, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      return error;
    }
  }

  private async subscribeWithPaystack(paymentDetails: any) {
    const url = `${this.paystackBaseUrl}/transaction/initialize`;

    try {
      const response = await axios.post(url, paymentDetails, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      throw new Error(error.response.data.message || 'An error occurred while initiating the payment');
    }
  }

  async verifyPayStackPayment(transactionReference: string, subscriptionId: string) {
    const url = `${this.paystackBaseUrl}/transaction/verify/${transactionReference}`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });

      if (response?.data?.data?.status === 'success') {
        // Handle successful payment here
        const subscription = await this.subscriptionRepository.findOne({
          where: { id: subscriptionId },
        });

        // Update subscription status
        subscription.status = 'active';
        subscription.transactionRef = transactionReference;
        await this.subscriptionRepository.save(subscription);

        return {
          message: 'Payment successful',
          data: response.data.data,
        };
      } else {
        return { message: 'Payment failed', data: { status: 'failed' } };
      }
    } catch (error) {
      return { message: 'Payment failed', data: { status: 'failed' } };
    }
  }
}
