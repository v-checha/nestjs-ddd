import { ValueObject } from '../../common/base/value-object.base';
import { InvalidUserException } from '../exceptions/invalid-user.exception';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  public static create(email: string): Email {
    if (!this.isValidEmail(email)) {
      throw new InvalidUserException('Email is invalid');
    }

    return new Email({ value: email.toLowerCase() });
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  }
}
