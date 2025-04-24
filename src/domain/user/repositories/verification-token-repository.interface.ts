import { VerificationToken, VerificationTokenType } from '../entities/verification-token.entity';

export interface VerificationTokenRepository {
  save(token: VerificationToken): Promise<void>;
  findByToken(token: string): Promise<VerificationToken | null>;
  findByUserId(userId: string, type: VerificationTokenType): Promise<VerificationToken | null>;
  deleteExpired(): Promise<void>;
  deleteByUserId(userId: string, type: VerificationTokenType): Promise<void>;
}