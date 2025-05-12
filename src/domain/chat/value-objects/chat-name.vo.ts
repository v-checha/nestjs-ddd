import { ValueObject } from '../../common/base/value-object.base';
import { DomainException } from '../../common/exceptions/domain.exception';

interface ChatNameProps {
  value: string;
}

export class ChatName extends ValueObject<ChatNameProps> {
  private constructor(props: ChatNameProps) {
    super(props);
  }

  static create(name: string): ChatName {
    if (!name || name.trim().length === 0) {
      throw new DomainException('Chat name cannot be empty');
    }

    if (name.trim().length < 3) {
      throw new DomainException('Chat name must be at least 3 characters');
    }

    if (name.trim().length > 50) {
      throw new DomainException('Chat name cannot exceed 50 characters');
    }

    return new ChatName({ value: name.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}
