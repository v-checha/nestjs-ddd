import { Entity } from '../../common/base/entity.base';
import { UserId } from '../../user/value-objects/user-id.vo';
import { MessageId } from '../value-objects/message-id.vo';

export interface MessageReadStatusProps {
  messageId: MessageId;
  userId: UserId;
  readAt: Date;
}

export class MessageReadStatus extends Entity<MessageReadStatusProps> {
  private constructor(props: MessageReadStatusProps) {
    // Composite key using messageId and userId
    super(props, `${props.messageId.value}_${props.userId.value}`);
  }

  static create(props: MessageReadStatusProps): MessageReadStatus {
    return new MessageReadStatus(props);
  }

  get messageId(): MessageId {
    return this.props.messageId;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get readAt(): Date {
    return this.props.readAt;
  }
}
