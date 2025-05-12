import { AggregateRoot } from '../../common/base/aggregate-root';
import { ChatId } from '../value-objects/chat-id.vo';
import { UserId } from '../../user/value-objects/user-id.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

interface PrivateChatParticipant {
  userId: UserId;
  joinedAt: Date;
  isActive: boolean;
}

export interface PrivateChatProps {
  participants: PrivateChatParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export class PrivateChat extends AggregateRoot<PrivateChatProps> {
  private constructor(props: PrivateChatProps, id?: string) {
    super(props, id);
  }

  static create(participants: { userId: UserId }[], id?: string): PrivateChat {
    if (!participants || participants.length !== 2) {
      throw new DomainException('Private chat requires exactly 2 participants');
    }

    if (participants[0].userId.equals(participants[1].userId)) {
      throw new DomainException('Private chat cannot have the same user twice');
    }

    const now = new Date();
    const privateChatParticipants: PrivateChatParticipant[] = participants.map(p => ({
      userId: p.userId,
      joinedAt: now,
      isActive: true,
    }));

    return new PrivateChat(
      {
        participants: privateChatParticipants,
        createdAt: now,
        updatedAt: now,
      },
      id ?? ChatId.create().value,
    );
  }

  get chatId(): ChatId {
    return ChatId.create(this.id);
  }

  get participants(): PrivateChatParticipant[] {
    return [...this.props.participants];
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  containsUser(userId: UserId): boolean {
    return this.props.participants.some(p => p.userId.equals(userId) && p.isActive);
  }

  deactivateParticipant(userId: UserId): void {
    const participant = this.props.participants.find(p => p.userId.equals(userId));

    if (!participant) {
      throw new DomainException('User is not a participant in this chat');
    }

    participant.isActive = false;
    this.props.updatedAt = new Date();
  }

  reactivateParticipant(userId: UserId): void {
    const participant = this.props.participants.find(p => p.userId.equals(userId));

    if (!participant) {
      throw new DomainException('User is not a participant in this chat');
    }

    participant.isActive = true;
    this.props.updatedAt = new Date();
  }

  areAllParticipantsActive(): boolean {
    return this.props.participants.every(p => p.isActive);
  }
}
