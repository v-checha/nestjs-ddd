import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {}

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // In a real app, this would connect to a mail provider like SendGrid, Mailgun, etc.
      // For now, we'll just log the email content
      this.logger.log(`Sending email to: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      this.logger.log(`Content: ${options.html}`);

      // Simulate successful email sending
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);

      return false;
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Email Verification</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('app.frontendUrl');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset</h1>
        <p>You have requested to reset your password. Please click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });
  }
}
