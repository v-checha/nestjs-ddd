import { AggregateRoot } from '../../common/base/aggregate-root';
import { ChatId } from '../value-objects/chat-id.vo';
import { ChatName } from '../value-objects/chat-name.vo';
import { UserId } from '../../user/value-objects/user-id.vo';
import { DomainException } from '../../common/exceptions/domain.exception';

interface GroupChatParticipant {
  userId: UserId;
  joinedAt: Date;
  isAdmin: boolean;
  isActive: boolean;
}

export interface GroupChatProps {
  name: ChatName;
  participants: GroupChatParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

export class GroupChat extends AggregateRoot<GroupChatProps> {
  private constructor(props: GroupChatProps, id?: string) {
    super(props, id);
  }

  static create(
    name: ChatName,
    creatorId: UserId,
    participants: { userId: UserId }[] = [],
    id?: string,
  ): GroupChat {
    const now = new Date();

    // Ensure creator is always the first admin
    const allParticipants: GroupChatParticipant[] = [
      {
        userId: creatorId,
        joinedAt: now,
        isAdmin: true,
        isActive: true,
      },
      ...participants.map(p => ({
        userId: p.userId,
        joinedAt: now,
        isAdmin: false,
        isActive: true,
      })),
    ];

    // Check for duplicate participants
    const uniqueUserIds = new Set<string>();
    allParticipants.forEach(p => {
      if (uniqueUserIds.has(p.userId.value)) {
        throw new DomainException('Group chat cannot have duplicate participants');
      }
      uniqueUserIds.add(p.userId.value);
    });

    return new GroupChat(
      {
        name,
        participants: allParticipants,
        createdAt: now,
        updatedAt: now,
      },
      id ?? ChatId.create().value,
    );
  }

  get chatId(): ChatId {
    return ChatId.create(this.id);
  }

  get name(): ChatName {
    return this.props.name;
  }

  get participants(): GroupChatParticipant[] {
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

  isAdmin(userId: UserId): boolean {
    const participant = this.props.participants.find(p => p.userId.equals(userId));

    return !!participant && participant.isAdmin;
  }

  addParticipant(userId: UserId): void {
    if (this.props.participants.some(p => p.userId.equals(userId))) {
      throw new DomainException('User is already a participant in this chat');
    }

    this.props.participants.push({
      userId,
      joinedAt: new Date(),
      isAdmin: false,
      isActive: true,
    });

    this.props.updatedAt = new Date();
  }

  removeParticipant(userId: UserId, removedBy: UserId): void {
    // Check if remover is an admin
    if (!this.isAdmin(removedBy)) {
      throw new DomainException('Only admins can remove participants');
    }

    const participantIndex = this.props.participants.findIndex(p => p.userId.equals(userId));

    if (participantIndex === -1) {
      throw new DomainException('User is not a participant in this chat');
    }

    // Cannot remove the only admin
    if (
      this.props.participants[participantIndex].isAdmin &&
      this.props.participants.filter(p => p.isAdmin).length === 1
    ) {
      throw new DomainException('Cannot remove the only admin from the group');
    }

    // Mark as inactive rather than removing
    this.props.participants[participantIndex].isActive = false;
    this.props.updatedAt = new Date();
  }

  makeAdmin(userId: UserId, promotedBy: UserId): void {
    // Check if promoter is an admin
    if (!this.isAdmin(promotedBy)) {
      throw new DomainException('Only admins can promote participants to admin');
    }

    const participant = this.props.participants.find(p => p.userId.equals(userId));

    if (!participant) {
      throw new DomainException('User is not a participant in this chat');
    }

    if (!participant.isActive) {
      throw new DomainException('Inactive participants cannot be made admin');
    }

    participant.isAdmin = true;
    this.props.updatedAt = new Date();
  }

  removeAdmin(userId: UserId, demotedBy: UserId): void {
    // Check if demoter is an admin
    if (!this.isAdmin(demotedBy)) {
      throw new DomainException('Only admins can demote other admins');
    }

    const participant = this.props.participants.find(p => p.userId.equals(userId));

    if (!participant) {
      throw new DomainException('User is not a participant in this chat');
    }

    if (!participant.isAdmin) {
      throw new DomainException('User is not an admin');
    }

    // Cannot demote the only admin
    if (this.props.participants.filter(p => p.isAdmin).length === 1) {
      throw new DomainException('Cannot demote the only admin in the group');
    }

    participant.isAdmin = false;
    this.props.updatedAt = new Date();
  }

  updateName(name: ChatName, updatedBy: UserId): void {
    if (!this.isAdmin(updatedBy)) {
      throw new DomainException('Only admins can update group name');
    }

    this.props.name = name;
    this.props.updatedAt = new Date();
  }
}
