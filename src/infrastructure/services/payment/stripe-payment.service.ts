import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

interface Money {
  amount: number;
  currency: string;
}

@Injectable()
export class StripePaymentService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    // In a real application, this would come from environment variables
    const apiKey = 'sk_test_your_stripe_key';
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-03-31.basil', // Use the latest API version
    });
  }

  async createPaymentIntent(amount: Money, orderId: string): Promise<string> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount.amount * 100), // Stripe requires amounts in cents
      currency: amount.currency.toLowerCase(),
      metadata: {
        orderId,
      },
    });

    return paymentIntent.client_secret as string;
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return paymentIntent.status === 'succeeded';
  }
}
