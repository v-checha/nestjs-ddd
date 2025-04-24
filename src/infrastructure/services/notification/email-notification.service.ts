import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class EmailNotificationService {
  constructor(private configService: ConfigService) {}

  /**
   * In a real application, this would integrate with an email service
   * like SendGrid, Mailgun, Amazon SES, etc.
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    // This is a placeholder implementation
    console.log(`Sending email to ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content: ${options.text || options.html}`);

    // Simulate successful sending
    return true;
  }

  async sendUserWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to our platform!',
      html: `<h1>Welcome, ${name}!</h1><p>Thank you for registering with us.</p>`,
    });
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    totalAmount: string,
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Order ${orderId} Confirmation`,
      html: `<h1>Your order has been confirmed!</h1><p>Order ID: ${orderId}</p><p>Total: ${totalAmount}</p>`,
    });
  }
}
