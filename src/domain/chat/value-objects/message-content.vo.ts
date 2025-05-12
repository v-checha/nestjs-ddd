import { ValueObject } from '../../common/base/value-object.base';
import { DomainException } from '../../common/exceptions/domain.exception';

interface MessageContentProps {
  value: string;
}

export class MessageContent extends ValueObject<MessageContentProps> {
  private constructor(props: MessageContentProps) {
    super(props);
  }

  static create(content: string): MessageContent {
    if (!content || content.trim().length === 0) {
      throw new DomainException('Message content cannot be empty');
    }

    if (content.trim().length > 2000) {
      throw new DomainException('Message content cannot exceed 2000 characters');
    }

    return new MessageContent({ value: content.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}
