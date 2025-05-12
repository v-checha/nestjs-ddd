import { DomainEvent } from '../../common/events/domain-event.interface';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';

export class UserAddedToGroupEvent implements DomainEvent {
  readonly eventName = 'UserAddedToGroup';
  readonly eventDate: Date;

  constructor(
    public readonly chatId: ChatId,
    public readonly userId: UserId,
    public readonly addedBy: UserId,
    timestamp?: Date,
  ) {
    this.eventDate = timestamp || new Date();
  }
}
