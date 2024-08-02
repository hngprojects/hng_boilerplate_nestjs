import { makePaymentDto } from './dto/make-payment.dto';

const { Injectable, HttpStatus } = require('@nestjs/common');
const axios = require('axios');
const Flutterwave = require('flutterwave-node-v3');
const { v4: uuid4 } = require('uuid');

@Injectable()
export class FlutterwaveService {
  generateTransactionId() {
    return uuid4();
  }
  flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
  async createPaymentPlan(details: { name: string; amount: number; interval: string }) {
    try {
      const response = await this.flw.PaymentPlan.create(details);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create payment plan');
    }
  }

  async getAllPaymentPlan() {
    try {
      const response = await this.flw.PaymentPlan.get_all();
      return {
        status_code: HttpStatus.OK,
        message: 'Payment plans retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getSinglePaymentPlan(id: string) {
    try {
      const response = await this.flw.PaymentPlan.get_plan({ id });
      return {
        status_code: HttpStatus.OK,
        message: 'Payment plan retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async updatePaymentPlan(id: string, payload: {}) {
    try {
      const response = await this.flw.PaymentPlan.update(payload);
      return {
        status_code: HttpStatus.OK,
        message: 'Payment plans updated successfully',
        data: response.data,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async cancelPaymentPlan(id: string) {
    try {
      const response = await this.flw.PaymentPlan.cancel({ id });
      return {
        status_code: HttpStatus.OK,
        message: 'Payment plans cancelled successfully',
        data: response.data,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async activateSubscription(id: string) {
    try {
      const findSub = await this.flw.Subscription.get(id);
      if (findSub.data.length == 0) {
        return {
          status: 'failed',
          message: 'No subscription with supplied ID',
          status_code: HttpStatus.NOT_FOUND,
        };
      }
      const response = await this.flw.Subscription.activate(id);
      return {
        status: 'success',
        message: 'Subscription plans activate successfully',
        data: response.data,
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async getAllSubscription() {
    try {
      const response = await this.flw.Subscription.fetch_all();
      return {
        status_code: HttpStatus.OK,
        message: 'Subscription plans retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async makePayment(data: makePaymentDto) {
    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: this.generateTransactionId(),
          amount: data.amount,
          currency: 'NGN',
          redirect_url: 'http://localhost:3008/payment/flutterwave/:id',
          payment_plan: data.plan_id,
          customer: {
            email: data.email,
            name: data.full_name,
            phonenumber: data.phone_number,
          },
          customizations: {
            title: 'Flutterwave Standard Payment',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(response)
      return response;
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }

  async verifyPayment(id: string) {
    try {
      const response = await this.flw.verify({ id });
      return {
        status: 'success',
        message: 'payment completed successfully',
        data: response.data,
        status_code: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        status_code: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    }
  }
}
