import { RefreshToken } from '../entities/refresh-token.entity';

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findAllByUserId(userId: string): Promise<RefreshToken[]>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}