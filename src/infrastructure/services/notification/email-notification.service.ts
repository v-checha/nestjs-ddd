import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export type EmailResult = {
  success: boolean;
  messageId?: string;
  error?: Error;
};

@Injectable()
export class EmailNotificationService {
  private readonly logger = new Logger(EmailNotificationService.name);

  constructor(private configService: ConfigService) {}

  /**
   * In a real application, this would integrate with an email service
   * like SendGrid, Mailgun, Amazon SES, etc.
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      // This is a placeholder implementation
      this.logger.log(`Sending email to ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log(`Content: ${options.text || options.html}`);

      // Simulate successful sending
      return {
        success: true,
        messageId: `mock-message-id-${Date.now()}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  async sendUserWelcomeEmail(email: string, name: string): Promise<EmailResult> {
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
  ): Promise<EmailResult> {
    return this.sendEmail({
      to: email,
      subject: `Order ${orderId} Confirmation`,
      html: `<h1>Your order has been confirmed!</h1><p>Order ID: ${orderId}</p><p>Total: ${totalAmount}</p>`,
    });
  }
}
