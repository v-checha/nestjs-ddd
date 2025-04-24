import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyEmailCommand } from './verify-email.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { VerificationTokenRepository } from '../../../../domain/user/repositories/verification-token-repository.interface';
import { TokenService } from '../../../../infrastructure/services/token.service';
import { UserMapper } from '../../mappers/user.mapper';
import { UserDto } from '../../dtos/user.dto';
import { VerificationTokenType } from '../../../../domain/user/entities/verification-token.entity';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand, UserDto> {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('VerificationTokenRepository')
    private readonly verificationTokenRepository: VerificationTokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<UserDto> {
    try {
      // Verify the token
      const verificationToken = await this.tokenService.verifyToken(command.token);

      if (verificationToken.type !== VerificationTokenType.EMAIL_VERIFICATION) {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find the user
      const userId = verificationToken.userId;
      const user = await this.userRepository.findById(UserId.create(userId));

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify the user
      user.verify();

      // Mark token as used
      verificationToken.markAsUsed();

      // Save both entities
      await this.userRepository.save(user);
      await this.verificationTokenRepository.save(verificationToken);

      return this.userMapper.toDto(user);
    } catch (_error) {
      if (_error instanceof NotFoundException || _error instanceof UnauthorizedException) {
        throw _error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
