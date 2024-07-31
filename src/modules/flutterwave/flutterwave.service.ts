import { Injectable } from '@nestjs/common';
import * as Flutterwave from 'flutterwave-node-v3';

@Injectable()
export class FlutterwaveService {
  private flw: any;

  constructor() {
    this.flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);
  }

  async create(details: { name: string; price: number; description: string }) {
    try {
      const response = await this.flw.PaymentPlan.create(details);
      console.log(response);
      return response;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create payment plan');
    }
  }
}
