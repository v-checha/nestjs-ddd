import { Entity } from '../../common/base/entity.base';
import { v4 as uuidv4 } from 'uuid';

interface RefreshTokenProps {
  token: string;
  userId: string;
  issuedAt: Date;
  expiresAt: Date;
  device?: string;
  ipAddress?: string;
  isRevoked: boolean;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: string) {
    super(props, id);
  }

  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get device(): string | undefined {
    return this.props.device;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked;
  }

  get isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public static create(props: RefreshTokenProps, id?: string): RefreshToken {
    return new RefreshToken(props, id ?? uuidv4());
  }

  public revoke(): void {
    this.props.isRevoked = true;
  }

  public isValid(): boolean {
    return !this.isRevoked && !this.isExpired;
  }
}
