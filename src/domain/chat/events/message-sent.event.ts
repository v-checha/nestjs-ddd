import { DomainEvent } from '../../common/events/domain-event.interface';
import { MessageId } from '../value-objects/message-id.vo';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';

export class MessageSentEvent implements DomainEvent {
  readonly eventName = 'MessageSent';
  readonly eventDate: Date;

  constructor(
    public readonly messageId: MessageId,
    public readonly chatId: ChatId,
    public readonly senderId: UserId,
    public readonly isPrivateChat: boolean,
    public readonly content: string,
    timestamp?: Date,
  ) {
    this.eventDate = timestamp || new Date();
  }
}
