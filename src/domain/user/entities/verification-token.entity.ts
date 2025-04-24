import { Entity } from '../../common/base/entity.base';
import { v4 as uuidv4 } from 'uuid';

export enum VerificationTokenType {
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
}

interface VerificationTokenProps {
  token: string;
  userId: string;
  type: VerificationTokenType;
  issuedAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

export class VerificationToken extends Entity<VerificationTokenProps> {
  private constructor(props: VerificationTokenProps, id?: string) {
    super(props, id);
  }

  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get type(): VerificationTokenType {
    return this.props.type;
  }

  get issuedAt(): Date {
    return this.props.issuedAt;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isUsed(): boolean {
    return this.props.isUsed;
  }

  get isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public static create(props: VerificationTokenProps, id?: string): VerificationToken {
    return new VerificationToken(props, id ?? uuidv4());
  }

  public markAsUsed(): void {
    this.props.isUsed = true;
  }

  public isValid(): boolean {
    return !this.isUsed && !this.isExpired;
  }
}
