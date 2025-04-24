import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from './refresh-token.command';
import { Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../../domain/user/repositories/user-repository.interface';
import { RefreshTokenRepository } from '../../../../domain/user/repositories/refresh-token-repository.interface';
import { TokenService } from '../../../../infrastructure/services/token.service';
import { JwtAuthService } from '../../../../infrastructure/authentication/jwt-auth.service';
import { AuthTokenDto } from '../../dtos/auth-token.dto';
import { UserId } from '../../../../domain/user/value-objects/user-id.vo';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler
  implements ICommandHandler<RefreshTokenCommand, AuthTokenDto>
{
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('RefreshTokenRepository')
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<AuthTokenDto> {
    try {
      // Get and validate the refresh token
      const refreshToken = await this.tokenService.getRefreshToken(command.refreshToken);
      
      // Find the user
      const userId = refreshToken.userId;
      const user = await this.userRepository.findById(UserId.create(userId));
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Revoke the current refresh token
      await this.tokenService.revokeRefreshToken(command.refreshToken);

      // Generate a new access token
      const accessToken = this.jwtAuthService.generateToken(user);

      // Generate a new refresh token
      const newRefreshToken = await this.tokenService.generateRefreshToken(
        user.id,
        refreshToken.device,
        refreshToken.ipAddress
      );

      // Update login timestamp
      user.updateLoginTimestamp();
      await this.userRepository.save(user);

      return {
        token: accessToken,
        refreshToken: newRefreshToken,
        userId: user.id,
        email: user.email.value,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}