import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '../../common/base/value-object.base';
import { DomainException } from '../../common/exceptions/domain.exception';

interface MessageIdProps {
  value: string;
}

export class MessageId extends ValueObject<MessageIdProps> {
  private constructor(props: MessageIdProps) {
    super(props);
  }

  static create(id?: string): MessageId {
    const value = id || uuidv4();

    if (!value) {
      throw new DomainException('Message ID cannot be empty');
    }

    return new MessageId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
