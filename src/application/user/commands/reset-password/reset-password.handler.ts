import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordCommand } from './reset-password.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { VerificationTokenRepository } from '../../../../domain/user/repositories/verification-token-repository.interface';
import { TokenService } from '../../../../infrastructure/services/token.service';
import { PasswordService } from '../../../../infrastructure/services/password.service';
import { UserMapper } from '../../mappers/user.mapper';
import { UserDto } from '../../dtos/user.dto';
import { VerificationTokenType } from '../../../../domain/user/entities/verification-token.entity';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand, UserDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('VerificationTokenRepository')
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<UserDto> {
    try {
      // Verify the token
      const verificationToken = await this.tokenService.verifyToken(command.token);

      if (verificationToken.type !== VerificationTokenType.PASSWORD_RESET) {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find the user
      const userId = verificationToken.userId;
      const user = await this.userRepository.findById(UserId.create(userId));

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Hash the new password
      const hashedPassword = await this.passwordService.hash(command.newPassword);

      // Update the user's password
      user.updatePassword(hashedPassword);

      // Mark token as used
      verificationToken.markAsUsed();

      // Save both entities
      await this.userRepository.save(user);
      await this.verificationTokenRepository.save(verificationToken);

      return this.userMapper.toDto(user);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
