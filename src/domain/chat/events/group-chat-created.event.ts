import { DomainEvent } from '../../common/events/domain-event.interface';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';

export class GroupChatCreatedEvent implements DomainEvent {
  readonly eventName = 'GroupChatCreated';
  readonly eventDate: Date;

  constructor(
    public readonly chatId: ChatId,
    public readonly name: string,
    public readonly creatorId: UserId,
    public readonly participants: UserId[],
    timestamp?: Date,
  ) {
    this.eventDate = timestamp || new Date();
  }
}
