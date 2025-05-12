import { DomainEvent } from '../../common/events/domain-event.interface';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';

export class PrivateChatCreatedEvent implements DomainEvent {
  readonly eventName = 'PrivateChatCreated';
  readonly eventDate: Date;

  constructor(
    public readonly chatId: ChatId,
    public readonly participants: UserId[],
    timestamp?: Date,
  ) {
    this.eventDate = timestamp || new Date();
  }
}
