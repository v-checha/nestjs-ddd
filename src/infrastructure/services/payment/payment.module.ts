import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripePaymentService } from './stripe-payment.service';

@Module({
  imports: [ConfigModule],
  providers: [StripePaymentService],
  exports: [StripePaymentService],
})
export class PaymentModule {}
