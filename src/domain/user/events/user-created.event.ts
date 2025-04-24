import { IDomainEvent } from '../../common/events/domain-event.interface';
import { User } from '../entities/user.entity';

export class UserCreatedEvent implements IDomainEvent {
  public readonly eventName = 'UserCreated';
  public readonly eventDate: Date;

  constructor(public readonly user: User) {
    this.eventDate = new Date();
  }
}
