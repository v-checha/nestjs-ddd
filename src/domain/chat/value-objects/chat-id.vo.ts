import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '../../common/base/value-object.base';
import { DomainException } from '../../common/exceptions/domain.exception';

interface ChatIdProps {
  value: string;
}

export class ChatId extends ValueObject<ChatIdProps> {
  private constructor(props: ChatIdProps) {
    super(props);
  }

  static create(id?: string): ChatId {
    const value = id || uuidv4();

    if (!value) {
      throw new DomainException('Chat ID cannot be empty');
    }

    return new ChatId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
