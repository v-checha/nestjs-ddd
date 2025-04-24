import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  VerificationToken,
  VerificationTokenType,
} from '@domain/user/entities/verification-token.entity';
import { VerificationTokenRepository } from '@domain/user/repositories/verification-token-repository.interface';

@Injectable()
export class PrismaVerificationTokenRepository implements VerificationTokenRepository {
  private readonly logger = new Logger(PrismaVerificationTokenRepository.name);

  constructor(private prisma: PrismaService) {}

  async save(token: VerificationToken): Promise<void> {
    try {
      await this.prisma.verificationToken.upsert({
        where: { id: token.id },
        update: {
          token: token.token,
          userId: token.userId,
          type: token.type,
          expiresAt: token.expiresAt,
          isUsed: token.isUsed,
        },
        create: {
          id: token.id,
          token: token.token,
          userId: token.userId,
          type: token.type,
          issuedAt: token.issuedAt,
          expiresAt: token.expiresAt,
          isUsed: token.isUsed,
        },
      });
    } catch (error) {
      this.logger.error(`Error saving verification token: ${error.message}`);
      throw new Error(`Failed to save verification token: ${error.message}`);
    }
  }

  async findByToken(token: string): Promise<VerificationToken | null> {
    try {
      const tokenData = await this.prisma.verificationToken.findUnique({
        where: { token },
      });

      if (!tokenData) return null;

      return this.mapToDomain(tokenData);
    } catch (error) {
      this.logger.error(`Error finding verification token: ${error.message}`);

      return null;
    }
  }

  async findByUserId(
    userId: string,
    type: VerificationTokenType,
  ): Promise<VerificationToken | null> {
    try {
      const tokenData = await this.prisma.verificationToken.findFirst({
        where: {
          userId,
          type,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { issuedAt: 'desc' },
      });

      if (!tokenData) return null;

      return this.mapToDomain(tokenData);
    } catch (error) {
      this.logger.error(`Error finding verification token for user: ${error.message}`);

      return null;
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      await this.prisma.verificationToken.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isUsed: true }],
        },
      });
    } catch (error) {
      this.logger.error(`Error deleting expired verification tokens: ${error.message}`);
      throw new Error(`Failed to delete expired verification tokens: ${error.message}`);
    }
  }

  async deleteByUserId(userId: string, type: VerificationTokenType): Promise<void> {
    try {
      await this.prisma.verificationToken.deleteMany({
        where: { userId, type },
      });
    } catch (error) {
      this.logger.error(`Error deleting verification tokens for user: ${error.message}`);
      throw new Error(`Failed to delete verification tokens for user: ${error.message}`);
    }
  }

  private mapToDomain(data: any): VerificationToken {
    return VerificationToken.create(
      {
        token: data.token,
        userId: data.userId,
        type: data.type as VerificationTokenType,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt,
        isUsed: data.isUsed,
      },
      data.id,
    );
  }
}
