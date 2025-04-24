import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { VerificationToken, VerificationTokenType } from '../../domain/user/entities/verification-token.entity';
import { RefreshToken } from '../../domain/user/entities/refresh-token.entity';
import { VerificationTokenRepository } from '../../domain/user/repositories/verification-token-repository.interface';
import { RefreshTokenRepository } from '../../domain/user/repositories/refresh-token-repository.interface';
import { add } from 'date-fns';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject('VerificationTokenRepository')
    private verificationTokenRepository: VerificationTokenRepository,
    @Inject('RefreshTokenRepository')
    private refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async generateVerificationToken(userId: string): Promise<string> {
    // Delete any existing verification tokens for this user
    await this.verificationTokenRepository.deleteByUserId(
      userId, 
      VerificationTokenType.EMAIL_VERIFICATION
    );

    // Create a new verification token
    const token = uuidv4();
    const expiresAt = add(new Date(), { hours: 24 });

    const verificationToken = VerificationToken.create({
      token,
      userId,
      type: VerificationTokenType.EMAIL_VERIFICATION,
      issuedAt: new Date(),
      expiresAt,
      isUsed: false,
    });

    await this.verificationTokenRepository.save(verificationToken);

    return token;
  }

  async generatePasswordResetToken(userId: string): Promise<string> {
    // Delete any existing password reset tokens for this user
    await this.verificationTokenRepository.deleteByUserId(
      userId, 
      VerificationTokenType.PASSWORD_RESET
    );

    // Create a new password reset token
    const token = uuidv4();
    const expiresAt = add(new Date(), { hours: 24 });

    const verificationToken = VerificationToken.create({
      token,
      userId,
      type: VerificationTokenType.PASSWORD_RESET,
      issuedAt: new Date(),
      expiresAt,
      isUsed: false,
    });

    await this.verificationTokenRepository.save(verificationToken);

    return token;
  }

  async verifyToken(token: string): Promise<VerificationToken> {
    const verificationToken = await this.verificationTokenRepository.findByToken(token);
    
    if (!verificationToken) {
      throw new Error('Token not found');
    }
    
    if (!verificationToken.isValid()) {
      throw new Error('Token is expired or already used');
    }

    return verificationToken;
  }

  async generateRefreshToken(
    userId: string, 
    device?: string, 
    ipAddress?: string
  ): Promise<string> {
    // Clean up expired tokens for this user
    const tokens = await this.refreshTokenRepository.findAllByUserId(userId);
    if (tokens.length >= 5) {
      // If the user has 5 or more active tokens, revoke the oldest ones
      const tokensToKeep = tokens.slice(0, 4);
      const tokensToRemove = tokens.slice(4);
      
      for (const token of tokensToRemove) {
        await this.refreshTokenRepository.deleteByToken(token.token);
      }
    }

    // Create a new refresh token
    const token = uuidv4();
    const expiresAt = add(new Date(), { days: 30 });

    const refreshToken = RefreshToken.create({
      token,
      userId,
      issuedAt: new Date(),
      expiresAt,
      device,
      ipAddress,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  async getRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    
    if (!refreshToken) {
      throw new Error('Token not found');
    }
    
    if (!refreshToken.isValid()) {
      throw new Error('Token is expired or revoked');
    }

    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const refreshToken = await this.refreshTokenRepository.findByToken(token);
    
    if (refreshToken) {
      refreshToken.revoke();
      await this.refreshTokenRepository.save(refreshToken);
    }
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.deleteAllByUserId(userId);
  }
}