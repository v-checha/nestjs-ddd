import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshToken } from '../../../domain/user/entities/refresh-token.entity';
import { RefreshTokenRepository } from '../../../domain/user/repositories/refresh-token-repository.interface';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  private readonly logger = new Logger(PrismaRefreshTokenRepository.name);

  constructor(private prisma: PrismaService) {}

  async save(token: RefreshToken): Promise<void> {
    try {
      await this.prisma.refreshToken.upsert({
        where: { id: token.id },
        update: {
          token: token.token,
          userId: token.userId,
          expiresAt: token.expiresAt,
          device: token.device,
          ipAddress: token.ipAddress,
          isRevoked: token.isRevoked,
        },
        create: {
          id: token.id,
          token: token.token,
          userId: token.userId,
          issuedAt: token.issuedAt,
          expiresAt: token.expiresAt,
          device: token.device,
          ipAddress: token.ipAddress,
          isRevoked: token.isRevoked,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving refresh token: ${error.message}`);
      throw new Error(`Failed to save refresh token: ${error.message}`);
    }
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      const tokenData = await this.prisma.refreshToken.findUnique({
        where: { token },
      });

      if (!tokenData) return null;

      return this.mapToDomain(tokenData);
    } catch (error) {
      this.logger.error(`Error finding refresh token: ${error.message}`);

      return null;
    }
  }

  async findAllByUserId(userId: string): Promise<RefreshToken[]> {
    try {
      const tokensData = await this.prisma.refreshToken.findMany({
        where: { userId },
        orderBy: { issuedAt: 'desc' },
      });

      return tokensData.map(this.mapToDomain);
    } catch (error) {
      this.logger.error(`Error finding refresh tokens for user: ${error.message}`);

      return [];
    }
  }

  async deleteByToken(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.delete({
        where: { token },
      });
    } catch (error) {
      this.logger.error(`Error deleting refresh token: ${error.message}`);
      throw new Error(`Failed to delete refresh token: ${error.message}`);
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting expired refresh tokens: ${error.message}`);
      throw new Error(`Failed to delete expired refresh tokens: ${error.message}`);
    }
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    } catch (error) {
      this.logger.error(`Error deleting refresh tokens for user: ${error.message}`);
      throw new Error(`Failed to delete refresh tokens for user: ${error.message}`);
    }
  }

  private mapToDomain(data: any): RefreshToken {
    return RefreshToken.create(
      {
        token: data.token,
        userId: data.userId,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        device: data.device,
        ipAddress: data.ipAddress,
        isRevoked: data.isRevoked,
      },
      data.id,
    );
  }
}
