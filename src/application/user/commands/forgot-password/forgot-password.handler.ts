import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForgotPasswordCommand } from './forgot-password.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { Email } from '../../../../domain/user/value-objects/email.vo';
import { TokenService } from '../../../../infrastructure/services/token.service';
import { EmailService } from '../../../../infrastructure/services/email.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand, void> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    // Find the user by email
    const email = Email.create(command.email);
    const user = await this.userRepository.findByEmail(email);

    // For security reasons, we don't want to reveal if a user exists
    // So we'll just return if the user doesn't exist
    if (!user) {
      return;
    }

    // Generate password reset token
    const resetToken = await this.tokenService.generatePasswordResetToken(user.id);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(command.email, resetToken);
  }
}
